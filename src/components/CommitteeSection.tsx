import React from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import chairpersonImg from '../assets/images/committee-members-chairperson.jpg';
import secretaryImg from '../assets/images/committee-members-secretary.jpeg';
import treasurerImg from '../assets/images/committee-members-treasurer.jpeg';

// Temporary images – replace with local assets once available
const committee = [
    {
        name: 'Mrs. Gurudhari (Reema) Sharma',
        title: 'Chairperson',
        photo: chairpersonImg,
    },
    // {
    //   name: 'Mr. Umesh Sharma',
    //   title: 'Trustee',
    //   photo: 'https://via.placeholder.com/400?text=Ravi+Joshi',
    // },
    {
        name: 'Mrs. Nirmala Agarwal',
        title: 'Secretary',
        photo: secretaryImg,
    },
    // {
    //     name: 'Mr. Ramesh Jindal',
    //     title: 'Joint Secretary',
    //     photo: 'https://via.placeholder.com/400?text=Kavita+Sharma',
    // },
    {
        name: 'Mrs. Rachana Nadgir',
        title: 'Treasurer',
        photo: treasurerImg,
    },
];

const CommitteeSection: React.FC = () => {
  const { trackEvent } = useGoogleAnalytics();

  return (
    <section id="committee" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Core Committee</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Meet Our Committee Members
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Dedicated volunteers guiding our association forward.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:flex-nowrap">
          {committee.map((member) => (
            <div
              key={member.name}
              className="w-full sm:w-60 flex-shrink-0 flex flex-col items-center text-center bg-white rounded-lg shadow-md p-6 transition duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              onClick={() => trackEvent('committee_click', 'committee', member.name)}
            >
              <img
                src={member.photo}
                alt={`${member.name} — ${member.title}`}
                className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-orange-500"
              />
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-gray-600 mt-1">{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitteeSection; 