import React from 'react';

const Card = ({ title, children, footer, onClick, onFooterClick }) => {
  return (
    <div 
      className={`bg-navy-900 rounded-2xl overflow-hidden shadow-xl mb-6 text-white border border-navy-800 ${onClick ? 'cursor-pointer hover:shadow-2xl transition-shadow' : ''}`}
      onClick={onClick}
    >
      {title && (
        <div className="p-5 border-b border-navy-800 bg-navy-950">
          <h3 className="text-2xl font-extrabold tracking-wide text-white">{title}</h3>
        </div>
      )}
      
      <div className="p-5">
        {children}
      </div>
      
      {footer && (
        <div 
          className={`p-4 bg-blue-900 text-center text-blue-300 hover:text-blue-200 transition-colors font-semibold tracking-wide ${onFooterClick ? 'cursor-pointer' : ''}`}
          onClick={onFooterClick}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;