import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface HeroSectionProps {
  imageUrl: string;
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ imageUrl, title, subtitle }) => {
  const router = useRouter();

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-b-3xl shadow-2xl">
      <button
        onClick={() => router.push('/dashboard')}
        className="absolute top-4 left-4 z-20 inline-flex items-center justify-center p-2 bg-black/30 text-white rounded-full backdrop-blur-sm hover:bg-black/50 transition-all duration-300 group"
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:-translate-x-1" />
      </button>

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
      <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl mb-2 animate-bounce-in">
          {title}
        </h1>
        <p className="text-white text-lg sm:text-xl opacity-90 font-medium animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default HeroSection;