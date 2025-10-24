import React from "react";
import Image from "next/image";
import logo from "@/assets/Black_word.png";

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:flex items-center md:items-start md:justify-between">
          <div className="flex justify-center md:justify-start mb-6 md:mb-0">
            <h2 className="font-bold">
              <Image src={"/Black.png"} alt="logo" width={60} height={60}></Image>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-12 justify-center mb-6 md:mb-0">
            <div className="mb-6 md:mb-0">
              <h3 className="font-bold text-lg mb-3">旗下服務</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://kaobar.dreamland-studio.org"
                    className="hover:text-gray-600 transition duration-150"
                  >
                    會考霸｜KarBao
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-12 justify-center mb-6 md:mb-0">
            <div className="mb-6 md:mb-0">
              <h3 className="font-bold text-lg mb-3">聯絡我們</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://kaobar.dreamland-studio.org"
                    className="hover:text-gray-600 transition duration-150"
                  >
                    電子郵件: official@dreamland-studio.org
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; 2025 築夢之地工作室｜Dreamland Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
