
import React from 'react';
import { User } from '../types';
import { AVATAR_OPTIONS } from '../constants';

interface AvatarDisplayProps {
  user: User;
  size?: 'sm' | 'lg' | 'xl';
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ user, size = 'lg' }) => {
  const { avatarCustomization } = user;
  const { face, headwear, eyewear, clothing, backgroundColor } = avatarCustomization;

  const headwearEmoji = AVATAR_OPTIONS.headwear[headwear as keyof typeof AVATAR_OPTIONS.headwear];
  const eyewearEmoji = AVATAR_OPTIONS.eyewear[eyewear as keyof typeof AVATAR_OPTIONS.eyewear];
  const clothingEmoji = AVATAR_OPTIONS.clothing[clothing as keyof typeof AVATAR_OPTIONS.clothing];

  const sizeClasses = {
    sm: {
      container: 'w-10 h-10',
      face: 'text-2xl',
      headwear: 'text-base top-[-2px]',
      eyewear: 'text-xs top-[9px]',
      clothing: 'text-base bottom-0',
    },
    lg: {
      container: 'w-24 h-24 border-4 border-white shadow-md',
      face: 'text-6xl',
      headwear: 'text-4xl top-[-5px]',
      eyewear: 'text-2xl top-[22px]',
      clothing: 'text-4xl bottom-0',
    },
    xl: {
        container: 'w-40 h-40',
        face: 'text-8xl',
        headwear: 'text-5xl top-[-5px]',
        eyewear: 'text-4xl top-[35px]',
        clothing: 'text-5xl bottom-2',
    }
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center flex-shrink-0 ${classes.container} ${backgroundColor}`}
    >
      <span
        className={`relative ${classes.face}`}
        style={{ zIndex: 10 }}
      >
        {face}
      </span>
       {eyewearEmoji && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${classes.eyewear}`}
          style={{ zIndex: 25 }}
        >
          {/* FIX: Render the .emoji property, not the whole object */}
          {eyewearEmoji.emoji}
        </span>
      )}
      {headwearEmoji && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${classes.headwear}`}
          style={{ zIndex: 20 }}
        >
          {/* FIX: Render the .emoji property, not the whole object */}
          {headwearEmoji.emoji}
        </span>
      )}
      {clothingEmoji && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${classes.clothing}`}
          style={{ zIndex: 5 }}
        >
          {/* FIX: Render the .emoji property, not the whole object */}
          {clothingEmoji.emoji}
        </span>
      )}
    </div>
  );
};

export default AvatarDisplay;