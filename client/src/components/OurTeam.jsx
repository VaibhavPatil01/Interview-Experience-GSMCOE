import React from 'react';
import TeamMemberCard from './TeamMemberCard';

const OurTeam = () => {
  const teamMembers = [
    {
      name: 'Vaibhav Patil',
      role: 'Software Developer',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      about:
        'Passionate about clean code, scalable systems, and solving real-world problems with elegant software.Passionate about clean code, scalable systems, and solving real-world problems with elegant software.',
      socialLinks: ['#', '#', '#'] // Replace with actual URLs
    },
    {
      name: 'Vaibhav Patil',
      role: 'Software Developer',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      about:
        'Passionate about clean code, scalable systems, and solving real-world problems with elegant software.Passionate about clean code, scalable systems, and solving real-world problems with elegant software.',
      socialLinks: ['#', '#', '#']
    },
    {
      name: 'Vaibhav Patil',
      role: 'Software Developer',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      about:
        'Passionate about clean code, scalable systems, and solving real-world problems with elegant software.Passionate about clean code, scalable systems, and solving real-world problems with elegant software.Passionate about clean code, scalable systems, and solving real-world problems with elegant software.',
      socialLinks: ['#', '#', '#']
    },
    {
      name: 'Vaibhav Patil',
      role: 'Software Developer',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      about:
        'Passionate about clean code, scalable systems, and solving real-world problems with elegant software.',
      socialLinks: ['#', '#', '#']
    }
  ];

  return (
    <section className="w-full py-20 px-4 bg-gradient-to-b from-primary/5 to-white ">
      <div className="mx-auto flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-12">
          Our <span className="text-primary">Team</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard
              key={index}
              name={member.name}
              role={member.role}
              image={member.image}
              about={member.about}
              socialLinks={member.socialLinks}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
