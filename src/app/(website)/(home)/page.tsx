"use client";
import Image from "next/image";
import logo from "@/assets/Black.png";
import { motion } from "framer-motion";

// import Squares from "@/components/background/Squares";
import Particles from "@/components/background/Particles";
import Link from "next/link";

const services = [
  {
    title: "會考霸｜Kaobar",
    idName: "kaobar",
    description: "一個整合會考資源、提供會考線上社群的免費資源整合平台，讓會考生再準備會考時事半功倍！",
    link: "https://kaobar.dreamland-studio.org",
    banner: "kaobar.png"
  },
  {
    title: "學測霸｜GSATBar",
    idName: "gsatbar",
    description: "完全免費的學測備戰平臺",
    link: "#",
    banner: "gsatbar.png"
  },
  {
    title: "OUTBOX",
    idName: "outbox",
    description:
      "這是一個所有人都能參加的創意競賽，你能使用AI以及你那創意的大腦發揮創意，創造、生成出一個作品並投稿上來，讓我們大家都看看！",
    link: "https://outbox.tw",
    banner: "outbox.png"
  },
];


const coop = [
  {
    title: "Novainit Studio",
    link: "https://novainit.studio",
    logo: "novainit.png"
  },
  {
    title: "The Pros With Bros",
    link: "https://www.instagram.com/the_pros_with_bros/",
    logo: "the_pros_with_bros.jpg"
  },
];

export default function Home() {
  return (
    <div>

      <div className="h-screen flex flex-col justify-center items-center leading-[5.5px] z-10">
        {/* <motion.div
          initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-black text-2xl mt-1.5 tracking-[4px] md:text-4xl text-center flex"
        >
          <img src={"/assets/Black_word.png"} alt="logo" className="w-80" ></img>
        </motion.div> */}
        <motion.div
          initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-gray-800 md:text-[50px] mb-1.5 text-2xl text-center flex items-center font-bold"
        >
          輔助學生尋找夢想、像夢想前進<br />提供資源整合平台、開闢築夢之路，讓夢不再是夢！
        </motion.div>
        <motion.div
          initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
          animate={{ clipPath: "inset(0%  0% 0% 0%)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-gray-500 md:text-lg mb-1.5 text-sm text-center flex items-center"
        >
          幻想夢、規劃夢、實現夢<br />You Will When You Believe
        </motion.div>
        <motion.div
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/oauth/demo"
            className="rounded-full bg-emerald-400/90 px-8 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
          >
            OAuth 授權示範
          </Link>
          <Link
            href="/oauth/authorize?client_id=demo&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=profile.basic&state=demo"
            className="rounded-full border border-gray-300 px-8 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            直接體驗授權頁
          </Link>
        </motion.div>
      </div>


      <div className="pt-15 pb-40 bg-white z-50">
        <div className="flex flex-col items-center justify-center mx-20 px-3">
          <motion.div
            initial={{ opacity: 0, transform: "translateY(40px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.2, ease: "easeIn" }} className="text-3xl font-bold text-gray-900 mb-3">
            關於我們
          </motion.div>

          <motion.div initial={{ opacity: 0, transform: "translateY(80px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.4, ease: "easeIn" }} className="flex flex-wrap xl:flex-nowrap w-[80%] justify-center xl:justify-start items-center gap-4">
            <Image src={"/illustration/light.png"} alt="logo" className="w-[full] rounded-lg group-hover:opacity-65 duration-300 transition-all" width={250} height={540}></Image>
            <div className="text-xl">築夢之地工作室由一群學生組成，我們發現臺灣教育對於學生的發展問題，所以我們創立這個組織希望能協助學生發展，提供學生有更多的道路與方式能實現夢想，完成自己想做的事情。不只如此，我們除了幫助學生完成夢想還提供相關的社群平台或資源整合平台，希望學生在學習階段也能更簡單更輕鬆</div>
          </motion.div>
        </div>
      </div>

      <div className="pt-15 pb-20 bg-white z-50">
        <div className="flex flex-col items-center justify-center mx-20 px-3">
          <div className="text-3xl font-bold text-gray-900 mb-3">
            我們的項目
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 w-full gap-4">
            {services.map((service, index) => (
              <motion.div
                initial={{ opacity: 0, transform: "translateY(-10px)" }}
                whileInView={{ opacity: 1, transform: "translateY(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 * index, }}
                key={index}
              >
                <a
                  className="bg-white rounded-lg p-4 flex-1 flex flex-col group cursor-pointer"
                  href={"/projects/" + service.idName}
                >
                  <Image src={"/projects/" + service.banner} alt="logo" className="w-[full] rounded-lg group-hover:opacity-65 duration-300 transition-all" width={800} height={540}></Image>

                  <div className="flex items-center mb-1">
                    <div className="text-[25px] mt-4 group-hover:-translate-y-2 text-gray-900 duration-300 transition-all">
                      {service.title}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 group-hover:-translate-y-3 duration-300 transition-all">{service.description}</div>
                  {/* <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
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
                </div> */}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      <div className="pt-15 pb-20 bg-white z-50">
        <div className="flex flex-col items-center justify-center mx-20 px-3">
          <div className="text-3xl font-bold text-gray-900 mb-3">
            我們的戰略夥伴
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 w-full gap-4">
            {coop.map((coop, index) => (
              <motion.div
                initial={{ opacity: 0, transform: "translateY(-10px)" }}
                whileInView={{ opacity: 1, transform: "translateY(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 * index, }}
                key={index}
              >
                <a
                  className="bg-white rounded-lg p-4 flex-1 flex flex-col group cursor-pointer justify-center items-center"
                  href={coop.link}
                >
                  <Image src={"/partner/" + coop.logo} alt="logo" className="w-[130px] rounded-[100%] group-hover:opacity-65 duration-300 transition-all" width={450} height={540}></Image>

                  <div className="flex items-center mb-1">
                    <div className="text-[24px] mt-4 group-hover:-translate-y-2 text-gray-900 duration-300 transition-all">
                      {coop.title}
                    </div>
                  </div>
                  {/* <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
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
                </div> */}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
