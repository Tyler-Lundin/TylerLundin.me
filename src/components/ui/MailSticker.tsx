import Image from 'next/image';

export function MailSticker() {

  return (
    <div 
      className="w-10 h-10"
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