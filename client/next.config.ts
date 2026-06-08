// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: "export",

//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Remove output: "export" so Vercel can handle your dynamic [id] routes */
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;