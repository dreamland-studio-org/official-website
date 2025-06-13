"use client";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, CheckSquare, Info } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// import logo from "@/assets/logo.png";
import { Discord } from "react-bootstrap-icons";

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "首頁",
      path: "/",
    },
    // {
    //   icon: <Users className="w-5 h-5" />,
    //   label: "關於我們",
    //   path: "/about",
    // },
  ];

  const socialItems = [
    {
      icon: <Discord className="w-5 h-5"></Discord>,
      label: "Discord",
      path: "https://dc.sunary.tw/",
    },
  ];

  return (
    <div className="fixed top-0 w-[80%] mx-[10%] z-50">
      <div className="mt-5 w-full h-18 flex justify-between items-center bg-white shadow-md rounded-lg px-4">
        {/* Left area with logo */}
        <div className="w-1/4 flex items-center space-x-2">
          <Image src={"/assets/logo.png"} alt="logo" width={40} height={40}></Image>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block">築夢之地工作室</h1>
        </div>

        {/* Center area with navigation */}
        {/* <div className="w-1/2 flex justify-center items-center"> */}
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-8">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;

              return (
                <Link href={item.path} key={index} className="relative group">
                  <div className="flex flex-col items-center pt-2 pb-1">
                    <div
                      className={`p-2 rounded-full transition-all duration-300 transform ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      } group-hover:-translate-y-1`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`text-xs font-medium transition-all duration-300 transform ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-800"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right area with social links */}
        {/* <div className="w-1/4 flex justify-end items-center">
          <div className="h-12 w-px bg-gray-200 mx-4" />

          <div className="flex items-center space-x-6">
            {socialItems.map((item, index) => {
              return (
                <Link
                  href={item.path}
                  key={index}
                  target={item.path.startsWith("http") ? "_blank" : ""}
                  className="relative group"
                >
                  <div className="flex flex-col items-center pt-2 pb-1">
                    <div
                      className={`p-2 rounded-full transition-all duration-300 transform text-gray-500 hover:text-gray-800 hover:bg-gray-100 group-hover:-translate-y-1`}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`text-xs font-medium transition-all duration-300 transform text-gray-500 group-hover:text-gray-800`}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
}
