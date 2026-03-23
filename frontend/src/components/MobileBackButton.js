import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const MobileBackButton = ({ label = 'Back', customPath = null }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (customPath) {
      navigate(customPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="md:hidden flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200 mb-4"
      title={label}
    >
      <ChevronLeft size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default MobileBackButton;
