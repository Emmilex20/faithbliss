import type { ImgHTMLAttributes } from 'react';

type ProfileBoosterIconProps = ImgHTMLAttributes<HTMLImageElement> & {
  glowId?: string;
};

export const ProfileBoosterIcon = ({
  glowId,
  alt = '',
  ...props
}: ProfileBoosterIconProps) => (
  <>
    {void glowId}
    <img src="/booster.svg" alt={alt} aria-hidden={alt ? undefined : true} draggable={false} {...props} />
  </>
);

export default ProfileBoosterIcon;
