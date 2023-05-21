import clsx from "clsx";
import { AiFillGithub, AiFillTwitterCircle, AiFillYoutube } from "react-icons/ai";

const
  T = 'transition-all ease-in-out',
  iconProps = {
    size: 60,
    className: `text-black dark:text-white self-center justify-self-center translate-y-0 group-hover:translate-y-1/4 group-hover:scale-110  ${T} box-content`
  };

const
  SOCIALS = [
    { name: 'Github', icon: <AiFillGithub color={'#6cc644'} {...iconProps} />, url: 'https://github.com/Tyler-Lundin/' },
    { name: 'Youtube', icon: <AiFillYoutube color={'#FF0000'} {...iconProps} />, url: 'https://youtube.com/@mediocreTyler' },
    { name: 'Twitter', icon: <AiFillTwitterCircle color={'#1DA1F2'} {...iconProps} />, url: 'https://twitter.com/mediocreTyler' },
  ]

export default function SocialMediaLinks() {

  return (
    <ul className={' grid grid-flow-col justify-items-center gap-4 lowercase relative z-40 w-fit mx-auto p-4 rounded-xl'}>
      {SOCIALS.map((social, index) => {
        const { icon, name, url } = social
        return (
          <li key={`${name}-${index}`} className={' h-min w-fit text-black dark:text-white '}>
            <a
              href={url} target={'_blank'}
              className={clsx('h-min w-full text-white group grid ', T,)}>
              {icon}
            </a>
          </li>
        )
      })}


    </ul>
  )
}
