import React from 'react';

interface TrustedCompaniesProps {
  isDarkMode: boolean;
}

export const TrustedCompanies: React.FC<TrustedCompaniesProps> = ({ isDarkMode }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#F2F2F7] text-black'}`}>
      <div className="text-center">
        <h2 className="text-4xl font-black mb-8 italic">TRUSTED BY INDUSTRY LEADERS</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
          <div className="text-2xl font-bold">TECHCORP</div>
          <div className="text-2xl font-bold">GLOBEX</div>
          <div className="text-2xl font-bold">ACME INC</div>
          <div className="text-2xl font-bold">DYNAMO</div>
          <div className="text-2xl font-bold">INFINITY</div>
        </div>
      </div>
    </div>
  );
};

export default TrustedCompanies;