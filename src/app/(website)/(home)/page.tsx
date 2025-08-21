"use client";
import Image from "next/image";
import logo from "@/assets/Black.png";
import { motion } from "framer-motion";

// import Squares from "@/components/background/Squares";
import Particles from "@/components/background/Particles";

const services = [
  {
    title: "會考霸｜Kaobar",
    description: "提供應屆會考生與教師免費的會考資源",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    link: "https://kaobar.dreamland-studio.org",
  },
  {
    title: "雲學院",
    description:
      "提供學生、用戶們一個線上學習社群，自由再裡面討論、探討、交流課業相關問題",
    icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
    link: "https://discord.gg/D5QweR8DvJ",
  },
];

export default function Home() {
  return (
    <div>
      <div>
        <div className="absolute top-0 left-0 w-full h-screen z-0">
          <Particles
            particleColors={["#000", "#000"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        <div className="absolute top-0 bg-white/15 h-screen w-full backdrop-blur-[1px] "></div>
      </div>
      <div className="h-screen flex flex-col justify-center items-center leading-[5.5px] z-10">
        <motion.div
          initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-black text-2xl mt-1.5 tracking-[4px] md:text-4xl text-center flex"
        >
          <img src={"/assets/Black_word.png"} alt="logo" className="w-80" ></img>
          {/* 夢之地工作室 */}
        </motion.div>
        <motion.div
          initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-gray-500 md:text-lg mb-1.5 text-sm text-center flex items-center"
        >
          打造新教育生態，改變臺灣教育現況。
        </motion.div>
      </div>

      <div className="shadow-[0_-10px_30px_rgba(0,0,0,0.15)] pt-15 pb-20">
        <div className="flex flex-col items-center justify-center mx-20 px-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            我們的教育服務
          </h1>

          <div className="flex flex-col md:flex-row w-full gap-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-300 hover:shadow-md flex-1 flex flex-col"
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <svg
                      className="w-4 h-4 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={service.icon}
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {service.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-700">{service.description}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                  <a
                    href={service.link}
                    target="_blank"
                    className="text-gray-800 hover:text-black text-xs font-medium flex items-center"
                  >
                    了解更多
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
