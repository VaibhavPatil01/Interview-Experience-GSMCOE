import { 
    findUserByEmail, 
    deleteUser, 
    createUser as createRepoUser, 
    updatePassword, 
    verifyUserEmail as verifyRepoUserEmail, 
    searchUsers, 
    countUsers, 
    getUserProfile, 
    updateUser,
    findUserById as findRepoUserById
} from '../repositories/userRepository.js';

// Business logic layer (currently delegating directly to repository)
export const findUser = findUserByEmail;
export const deleteUserService = deleteUser;
export const createUser = createRepoUser;
export const resetPasswordService = updatePassword;
export const verifyUserEmail = verifyRepoUserEmail;
export const searchUserService = searchUsers;
export const countUsersService = countUsers;
export const getUserProfileService = getUserProfile;
export const updateUserService = updateUser;
export const findUserById = findRepoUserById;
