import Image from 'next/image';

export function MailSticker() {

  return (
    <div 
      className="w-6 h-6"
    >
      <div className="relative w-full h-full">
        <Image
          src="/images/contact-icon.webp"
          alt="Brain Sticker"
          fill
          className="transition-all duration-500"
        />
      </div>
    </div>
  );
} 
