import Image from "next/image";
import AnimatedBackground from "../AnimatedBackground";

export default function ResponsiveDevices() {
    return (
        <div className="relative flex justify-center items-center group">
            <div className="transition-all w-80 h-80 lg:w-96 lg:h-96 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-gray-950/50 -z-50 relative rounded-lg border border-white/10 shadow-inner">
                <Image
                    src="/images/landing-page/hero-devices.png"
                    alt="Tyler Lundin"
                    fill
                    priority
                    sizes="(max-width: 1200px) 400px, 500px"
                    className="object-cover object-top rounded-lg pointer-events-none dark:invert group-hover:sepia transition-all duration-300"
                />
                <AnimatedBackground />
                    <LaptopImage /> 
                    <MobileImage />

            </div>
        </div>
    )
}

const LaptopImage = () => {
    return (
        <div>
        <div className="bg-gray-100 dark:bg-black w-[192px] h-[150px] lg:w-[225px] lg:h-[168px] absolute top-[70px] left-[50px] lg:top-[92px] lg:left-[65px] -z-10 -skew-y-[14deg] p-2 grid place-items-center">
        <div className="relative hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-300 px-2 rounded-lg">
            <h4 className="text-white font-bold text-sm">
                Desktop
            </h4>
        </div>
        <small className="text-black/75 dark:text-white/75 text-xs font-light absolute top-4 left-1/2 -translate-x-1/2">
            TylerLundin.me
        </small>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full blur-3xl w-64 h-64 z-10 bg-white/20 -z-10 skew-y-[13deg] p-2 grid place-items-center" />
        </div>
    )
}

const MobileImage = () => {
    const lgPosition = "lg:w-[65px] lg:h-[126px] lg:top-[236px] lg:left-[360px] lg:rotate-[2deg] lg:skew-y-[15deg]"
    const mdPosition = "w-[55px] h-[100px] top-[198px] left-[300px] rotate-[2deg] skew-y-[15deg]"

    return (
        <div className={`bg-gray-100 dark:bg-black absolute grid place-content-center -z-10  grid place-items-center ${lgPosition} ${mdPosition} `}>
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-300 p-[4px] rounded-lg">
                
                <small className="text-white font-bold text-[13px] font-thin ">
                        Mobile
                        Friendly
                </small>
            </div>
        </div>
    )
}