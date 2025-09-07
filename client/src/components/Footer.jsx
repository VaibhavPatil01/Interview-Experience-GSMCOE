import React from 'react';
import { assets, footer_data } from '../assets/assets';

const Footer = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-primary/10 ">
      <div className="flex flex-col lg:flex-row lg:items-center items-start justify-between gap-7 md:gap-15 py-7 border-b border-gray-500/30  text-gray-500">
        <div>
          <img src={assets.logo} alt="logo" className="w-70 sm:w-100 " />
          <p className=" mt-6">
            Interview Experience GSMCOE is a student-led platform empowering peers with firsthand
            insights into interviews across diverse companies and roles. Whether preparing for
            placements or refining strategies, students learn from those who’ve been there. By
            contributing and engaging, users foster a culture of collaboration, growth, and shared
            success.
          </p>
          <div className="flex items-center gap-5 mt-6">
            <a href="https://www.facebook.com/people/Genba-Sopanrao-Moze-College-of-Engineering-Balewadi/100086298229102/">
              {' '}
              <img src={assets.facebook_icon} className="w-5 h-5" alt="" />{' '}
            </a>
            <a href="https://www.instagram.com/gsmoze_official/">
              {' '}
              <img src={assets.insta_icon} className="w-5 h-5" alt="" />{' '}
            </a>
            <a href="mailto:interviewexperiencegsmcoe@gmail.com">
              {' '}
              <img src={assets.mail_icon} className="w-5 h-5" alt="" />{' '}
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {footer_data.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.path} className="hover:underline transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        Copyright 2025 © Interview Experience GSMCOE - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
