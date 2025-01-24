import { PLACEHOLDER_LOGO_URL } from '@/lib/constants/imgPath';
import Image from 'next/image';

interface OrganizationLogoProps {
  logoSrc?: string; // Optional logo source
  altText?: string; // Optional alt text
}

const OrganizationLogo: React.FC<OrganizationLogoProps> = ({
  logoSrc,
  altText = 'Organization Logo',
}) => {
  const placeholderSrc = PLACEHOLDER_LOGO_URL; // Fallback to placeholder

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Image
        src={logoSrc || placeholderSrc}
        alt={altText}
        width={150}
        height={150}
        priority
        className="object-contain rounded-md shadow"
      />
    </div>
  );
};

export default OrganizationLogo;
