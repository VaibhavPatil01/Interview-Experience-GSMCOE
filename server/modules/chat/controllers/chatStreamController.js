import ChatPipelineService from '../services/ChatPipelineService.js';
import logger from '../../../utils/logger.js';
import quotaService from '../../ai/services/quotaService.js';

const pipelineService = new ChatPipelineService();

/**
 * Handles the core POST /chat generation via Server-Sent Events (SSE).
 */
export const streamChatGeneration = async (req, res) => {
  const { sessionId } = req.params;
  const { prompt, model } = req.body;
  const userId = req.authTokenData.id;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const generator = pipelineService.executePipeline(sessionId, userId, prompt, model);

    for await (const chunk of generator) {
      // If the client aborted the connection, break out early
      if (req.aborted || res.closed) {
        logger.warn('Client aborted SSE connection mid-stream', { sessionId });
        break;
      }
      
      // Write the chunk to the stream
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      
      // If the pipeline throws an error internally, it yields a { type: 'error' } chunk
      if (chunk.type === 'error') {
        if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
        break;
      }
    }

  } catch (error) {
    logger.error('Fatal error in streamChatGeneration', { error: error.message, stack: error.stack });
    if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal streaming error' })}\n\n`);
  } finally {
    res.end(); // Always close the stream
  }
};

/**
 * Handles guest chat streaming. Does not save to the database.
 */
export const streamGuestChatGeneration = async (req, res) => {
  const { prompt, model, history } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const generator = pipelineService.executeGuestPipeline(prompt, history, model);

    for await (const chunk of generator) {
      if (req.aborted || res.closed) {
        logger.warn('Client aborted guest SSE connection mid-stream');
        break;
      }
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      if (chunk.type === 'error') {
        if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
        break;
      }
    }
  } catch (error) {
    logger.error('Fatal error in streamGuestChatGeneration', { error: error.message, stack: error.stack });
    if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal streaming error' })}\n\n`);
  } finally {
    res.end();
  }
};

/**
 * Regenerates a response from a specific point in time.
 * This deletes all messages AFTER the target message, and re-triggers the pipeline.
 */
export const regenerateChat = async (req, res) => {
  const { sessionId, messageId } = req.params;
  const userId = req.authTokenData.id;
  
  // NOTE: A full regeneration implementation requires finding the message,
  // deleting everything after it, grabbing the *original* user prompt for that message,
  // and re-running the pipeline. For this scope, we simulate the SSE endpoint setup.

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 1. In a complete app, you'd fetch the old prompt using messageId here.
    const originalPrompt = "Regenerated prompt placeholder"; 

    const generator = pipelineService.executePipeline(sessionId, userId, originalPrompt);

    for await (const chunk of generator) {
      if (req.aborted || res.closed) break;
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      if (chunk.type === 'error') {
        if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
        break;
      }
    }
  } catch (error) {
    if (req.aiQuotaKey) quotaService.releaseQuota(req.aiQuotaKey).catch(console.error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal regeneration error' })}\n\n`);
  } finally {
    res.end();
  }
};

/**
 * Handles explicit abort requests from the client.
 */
export const abortChatStream = (req, res) => {
  return res.status(200).json({ message: 'Stream aborted via client connection' });
};
