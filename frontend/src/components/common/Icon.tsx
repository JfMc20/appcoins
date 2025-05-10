import React from 'react';
import { IconType, IconBaseProps } from 'react-icons';

interface IconProps {
  icon: IconType;
  className?: string;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ icon, className = '', size, color }) => {
  const IconComponent = icon as React.FC<IconBaseProps>;
  
  return (
    <div className={`icon-wrapper ${className}`}>
      <IconComponent size={size} color={color} />
    </div>
  );
};

export default Icon; 