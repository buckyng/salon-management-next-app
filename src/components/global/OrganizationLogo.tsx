
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
    <div className="flex items-center justify-center h-16">
      {logoSrc ? (
        <Image
          src={logoSrc || placeholderSrc} // Ensure a valid src is always passed
          alt={altText}
          width={150}
          height={64}
          priority
          className="object-contain"
        />
      ) : (
        <Image
          src={placeholderSrc} // Render the placeholder if logoSrc is empty
          alt="Default Logo"
          width={150}
          height={64}
          priority
          className="object-contain"
        />
      )}
    </div>
  );
};

export default OrganizationLogo;
