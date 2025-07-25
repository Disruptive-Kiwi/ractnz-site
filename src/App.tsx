import { useState } from 'react';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';
import { CheckIcon } from '@heroicons/react/24/outline';
import heroImage from './assets/images/ractnz-group-pic.jpg';
import eventCulturalDay from './assets/images/event-cultural-day.png';
import eventDiwaliDance from './assets/images/event-diwali-dance.jpeg';
import eventGangaurPuja from './assets/images/event-gangaur-puja.jpeg';
import eventHariyaliTeej from './assets/images/event-hariyali-teej.jpg';
import eventBasantPanchmiPicnic from './assets/images/event-basant-panchmi-picnic.jpeg';
import CommitteeSection from './components/CommitteeSection';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { trackEvent } = useGoogleAnalytics();

  // Smooth scroll function for navigation links
  const smoothScrollTo = (targetId: string) => {
    if (targetId === 'top') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 80; // Adjust based on your header height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle navigation click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    setMobileMenuOpen(false); // Close mobile menu if open
    trackEvent('navigation_click', 'navigation', targetId);
  };

  // Handle hero CTA clicks with additional tracking
  const handleHeroCTAClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string, ctaType: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    trackEvent('hero_cta_click', 'hero', ctaType);
  };
  
  // Helper function to format event dates
  const formatEventDate = (dateString: string) => {
    // Check if it's just month and year (like "June 2025", "July 2025")
    const monthYearPattern = /^[A-Za-z]+ \d{4}$/;
    
    if (monthYearPattern.test(dateString)) {
      // Just return the month and year as-is
      return dateString;
    }
    
    // If it's a specific date, format it properly
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-NZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Fallback: return as-is if we can't parse it
    return dateString;
  };
  
  // Mock data for events
  const events = [
    {
      id: 1,
      title: "International Yoga Day",
      date: "21st June 2025",
      location: "Avondale Community Centre",
      description: "Yoga, mindfulness, and wellness celebration."
    },
    {
      id: 2,
      title: "Teej Mela (Fair)",
      date: "2nd August 2025",
      location: "Blockhouse Bay Community Centre",
      description: "Traditional Rajasthani festivals celebration."
    },
    {
      id: 3,
      title: "Ganesh Chaturthi",
      date: "August 2025",
      location: "TBC",
      description: "Lord Ganesha festival with prayers and performances."
    }
  ];

  // Mock data for gallery
  const gallery = [
    { id: 1, src: eventCulturalDay, alt: "Rajasthani Cultural Day" },
    { id: 2, src: eventGangaurPuja, alt: "Gangaur Puja" },
    { id: 3, src: eventDiwaliDance, alt: "Auckland Diwali Dance" },
    { id: 4, src: eventHariyaliTeej, alt: "Hariyali Teej" },
    { id: 5, src: eventBasantPanchmiPicnic, alt: "Basant Panchmi Picnic" },
    { id: 6, src: heroImage, alt: "Rajasthan Diwas Celebration" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="w-full py-6 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center">
              <a href="#" onClick={(e) => handleNavClick(e, 'top')}>
                <span className="sr-only">Rajasthan Association NZ</span>
                  <img className="h-12 w-12" src="/ractnz-small-logo.svg" alt="RACTNZ Small Logo" />
              </a>
              <a href="#" onClick={(e) => handleNavClick(e, 'top')} className="ml-3 text-xl font-bold text-gray-900">Rajasthan Association NZ</a>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-base font-medium text-gray-500 hover:text-gray-900">About</a>
              <a href="#events" onClick={(e) => handleNavClick(e, 'events')} className="text-base font-medium text-gray-500 hover:text-gray-900">Events</a>
              <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="text-base font-medium text-gray-500 hover:text-gray-900">Gallery</a>
              <a href="#join" onClick={(e) => handleNavClick(e, 'join')} className="text-base font-medium text-gray-500 hover:text-gray-900">Join Us</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-base font-medium text-gray-500 hover:text-gray-900">Contact</a>
              <a href="#committee" onClick={(e) => handleNavClick(e, 'committee')} className="text-base font-medium text-gray-500 hover:text-gray-900">Committee</a>
            </div>
            <div className="flex md:hidden">
              <button
                type="button"
                className="-mr-2 p-2 rounded-md inline-flex items-center justify-center text-gray-400"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  trackEvent('mobile_menu_toggle', 'navigation', mobileMenuOpen ? 'close' : 'open');
                }}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a
                href="#about"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>
              <a
                href="#events"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'events')}
              >
                Events
              </a>
              <a
                href="#gallery"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'gallery')}
              >
                Gallery
              </a>
              <a
                href="#join"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'join')}
              >
                Join Us
              </a>
              <a
                href="#contact"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                Contact
              </a>
              <a
                href="#committee"
                className="block pl-3 pr-4 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={(e) => handleNavClick(e, 'committee')}
              >
                Committee
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-500 to-orange-500 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl pr-3">
                  <span className="block xl:inline">Connecting Rajasthanis</span>{' '}
                  <span className="block text-yellow-300 xl:inline">in New Zealand</span>
                </h1>
                <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Celebrating our rich heritage, fostering connections, and building a vibrant Rajasthani community across Aotearoa.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="#join"
                      onClick={(e) => handleHeroCTAClick(e, 'join', 'join_us_hero')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-orange-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      Join Us
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#events"
                      onClick={(e) => handleHeroCTAClick(e, 'events', 'upcoming_events_hero')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 md:py-4 md:text-lg md:px-10"
                    >
                      Upcoming Events
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src={heroImage}
            alt="Ractnz group picture"
          />
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">About Us</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Celebrating Our Rajasthani Roots in Aotearoa
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Bridging cultures and building community through shared heritage and traditions.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                <p className="mt-4 text-gray-600">
                  The Rajasthan Association of New Zealand was founded to bring together the diverse Rajasthani community living across Aotearoa. 
                  We aim to preserve and promote Rajasthani culture while embracing our new home in New Zealand.
                </p>
                <p className="mt-4 text-gray-600">
                  Through cultural events, educational programs, and community service, we create opportunities for Rajasthani people to connect, celebrate their heritage, and contribute to New Zealand's multicultural society.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900">Our Values</h3>
                <ul className="mt-4 space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Preservation of Rajasthani culture and traditions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Fostering connections among Rajasthani people in New Zealand</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Promoting understanding between Rajasthani and New Zealand cultures</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Supporting community development and charitable causes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Providing a support network for new immigrants from Rajasthan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <CommitteeSection />

      {/* Events Section */}
      <section id="events" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Events</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Upcoming & Past Events
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Celebrating our heritage through vibrant cultural events and community gatherings.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                  <div className="mt-2 flex items-center text-gray-500">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventDate(event.date)}</span>
                  </div>
                  <div className="mt-2 flex items-center text-gray-500">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  <p className="mt-4 text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Gallery</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Moments from Our Community
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Capturing the spirit and vibrancy of our Rajasthani community events.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gallery.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-md transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <img
                  className="w-full h-64 object-cover transition duration-300 group-hover:scale-110"
                  src={image.src}
                  alt={image.alt}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-end">
                  <p className="text-white p-4 text-lg font-medium">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://www.facebook.com/profile.php?id=61555767819964"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('gallery_click', 'gallery', 'view_more_photos')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition duration-150 ease-in-out"
            >
              View More Photos
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Get Involved</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Join Our Community
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Be part of our vibrant Rajasthani family in New Zealand.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Membership Benefits</h3>
                              <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Access to exclusive community events and festivals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Opportunities to connect with fellow Rajasthani expatriates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Participation in cultural preservation initiatives</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Support for new immigrants from Rajasthan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Discounts on event tickets</span>
                  </li>
                </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Join Our Community</h3>
              
              <div className="text-center">
                <p className="text-gray-600 mb-8">
                  Ready to become part of our vibrant Rajasthani community? Fill out our membership application form and we'll get back to you soon!
                </p>
                
                              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdmZFwsOkWwh5wprRLtggi2LvEkNKD1N2zxLL9xbgQM5jpHrg/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('form_click', 'membership', 'membership_form')}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              >
                  Fill Out Membership Form
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <p className="text-sm text-gray-500 mt-4">
                  The form will open in a new tab and takes about 2-3 minutes to complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Contact</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Get in Touch
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Have questions or want to connect? We'd love to hear from you!
            </p>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-12 max-w-2xl mx-auto shadow-md">
              <svg className="h-16 w-16 text-orange-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Send us an email</h3>
              <p className="text-gray-600 mb-8">
                For any questions, membership inquiries, or general information, feel free to reach out to us directly.
              </p>
              
              <a
                href="mailto:ractnz@gmail.com"
                onClick={() => trackEvent('email_click', 'contact', 'email_contact')}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
              >
                                 <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
                 <span className="md:hidden">Email Us</span>
                 <span className="hidden md:inline">Email Us: ractnz@gmail.com</span>
              </a>
              
              <p className="text-sm text-gray-500 mt-4">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <a href="#" onClick={(e) => handleNavClick(e, 'top')}>
                  <span className="sr-only">Rajasthan Association NZ</span>
                    <img className="h-12 w-12" src="/ractnz-small-logo.svg" alt="RACTNZ Small Logo" />
                </a>
                <a href="#" onClick={(e) => handleNavClick(e, 'top')} className="ml-3 text-xl font-bold text-white">Rajasthan Association NZ</a>
              </div>
              <p className="mt-4 text-gray-300">
                The Rajasthan Association of New Zealand connects the Rajasthani community across Aotearoa, 
                promoting cultural heritage and fostering friendships among people from all backgrounds.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-base text-gray-300 hover:text-white">About Us</a>
                </li>
                <li>
                  <a href="#events" onClick={(e) => handleNavClick(e, 'events')} className="text-base text-gray-300 hover:text-white">Events</a>
                </li>
                <li>
                  <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="text-base text-gray-300 hover:text-white">Gallery</a>
                </li>
                <li>
                  <a href="#join" onClick={(e) => handleNavClick(e, 'join')} className="text-base text-gray-300 hover:text-white">Join Us</a>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-base text-gray-300 hover:text-white">Contact</a>
                </li>
                <li>
                  <a href="#committee" onClick={(e) => handleNavClick(e, 'committee')} className="text-base text-gray-300 hover:text-white">Committee</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Social Media</h3>
              <div className="mt-4 flex space-x-6">
                <a 
                  href="https://www.facebook.com/profile.php?id=61555767819964" 
                  onClick={() => trackEvent('social_click', 'social_media', 'facebook')}
                  className="text-gray-300 hover:text-white"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/rajasthan.nz/" 
                  onClick={() => trackEvent('social_click', 'social_media', 'instagram')}
                  className="text-gray-300 hover:text-white"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                {/* Hide Twitter link for now */}
                {/* <a href="#" className="text-gray-300 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a> */}
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} Rajasthan Association NZ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
