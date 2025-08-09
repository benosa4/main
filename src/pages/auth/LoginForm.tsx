// import { login } from "../../features/auth/api";
// import shieldWithBolt from "../../assets/shield-with-bolt.svg";

// export default function LoginForm() {
//   return (
//     <div className="
//       w-full min-h-screen
//       flex items-center justify-center
//       bg-gradient-to-r from-blue-500 to-cyan-400
//       overflow-hidden
//       relative
//     ">
//       {/* Фоновые волны/круги для динамики */}
//       <div className="absolute w-96 h-96 bg-white opacity-20 rounded-full blur-3xl -top-20 -left-20 animate-ping-slow" />
//       <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full blur-2xl -bottom-16 -right-16 animate-pulse" />

//       {/* Карточка со стеклянным эффектом */}
//       <div className="
//         relative z-10
//         max-w-md w-full
//         rounded-[2rem]
//         p-8
//         m-4
//         flex flex-col items-center
//         bg-white/20
//         backdrop-blur-xl
//         border border-white/20
//         shadow-lg
//         animate-fadeInUp
//       ">
//         {/* Логотип */}
//         <img
//           src={shieldWithBolt}
//           alt="Passkey Logo"
//           className="w-14 h-14 mb-4 animate-bounce-slow"
//         />
//         {/* Заголовок */}
//         <h1 className="text-3xl font-extrabold text-gray-800 mb-1 text-center">
//           Добро пожаловать в Passkey!
//         </h1>
//         <p className="text-gray-700 text-center mb-6 text-sm">
//           Войдите с помощью Keycloak и забудьте пароли
//         </p>

//         {/* Градиентная кнопка */}
//         <button
//           onClick={login}
//           className="
//             w-full py-3
//             bg-gradient-to-r from-indigo-500 to-purple-600
//             hover:from-indigo-400 hover:to-purple-500
//             text-white
//             font-semibold
//             rounded-md
//             shadow-md
//             flex items-center justify-center
//             gap-2
//             transition-transform
//             transform hover:-translate-y-[1px]
//             active:translate-y-0
//           "
//         >
//           {/* Иконка на кнопке */}
//           <svg 
//             xmlns="http://www.w3.org/2000/svg" 
//             className="w-5 h-5" 
//             fill="none" 
//             viewBox="0 0 24 24" 
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
//           </svg>
//           <span>Войти через Keycloak</span>
//         </button>

//         <p className="mt-4 text-xs text-gray-600 text-center">
//           Нажимая кнопку, вы принимаете условия{" "}
//           <a
//             href="/terms"
//             className="text-indigo-600 hover:text-purple-600 underline"
//           >
//             пользовательского соглашения
//           </a>.
//         </p>
//       </div>
//     </div>
//   );
// }

// import { login } from "../../features/auth/api";
// import shieldWithBolt from "../../assets/shield-with-bolt.svg";

// export default function LoginForm() {
//   return (
//     <div className="
//       relative
//       w-full min-h-screen
//       flex items-center justify-center
//       overflow-hidden
//       bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300
//       p-6
//     ">
//       {/* Полупрозрачные волны/эллипсы в фоне */}
//       <div className="absolute top-0 left-[-20%] w-[60vw] h-[80vh] bg-white/10 rounded-full blur-3xl animate-blob1" />
//       <div className="absolute bottom-[-30%] right-[-10%] w-[50vw] h-[50vw] bg-white/20 rounded-full blur-2xl animate-blob2" />

//       {/* Стеклянная карточка */}
//       <div className="
//         relative
//         z-10
//         w-full max-w-md
//         px-8 py-10
//         bg-white/20
//         backdrop-blur-md
//         border border-white/30
//         rounded-3xl
//         shadow-2xl
//         flex flex-col items-center
//         animate-fadeInScale
//       ">
//         {/* Логотип */}
//         <img
//           src={shieldWithBolt}
//           alt="Passkey Logo"
//           className="w-14 h-14 mb-4 animate-bounce-slow"
//         />

//         <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
//           Добро пожаловать в Passkey!
//         </h1>
//         <p className="text-sm text-gray-700 text-center mb-6">
//           Войдите с помощью Keycloak и забудьте пароли
//         </p>

//         <button
//           onClick={login}
//           className="
//             w-full py-3
//             bg-gradient-to-r from-indigo-500 to-purple-600
//             hover:from-indigo-400 hover:to-purple-500
//             text-white
//             font-semibold
//             rounded-md
//             shadow-md
//             flex items-center justify-center
//             gap-2
//             transition-all
//             transform hover:-translate-y-[1px]
//             active:translate-y-0
//           "
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
//           </svg>
//           <span>Войти через Keycloak</span>
//         </button>

//         <p className="mt-4 text-xs text-gray-600 text-center">
//           Нажимая кнопку, вы принимаете условия{" "}
//           <a href="/terms" className="text-indigo-600 hover:text-purple-600 underline">
//             пользовательского соглашения
//           </a>.
//         </p>
//       </div>
//     </div>
//   );
// }

import { login } from "../../features/auth/api";
import shieldWithBolt from "../../assets/shield-with-bolt.svg";

export default function LoginForm() {
  return (
    <div className="
      relative w-full min-h-screen 
      flex items-center justify-center
      bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300
      overflow-hidden
      p-6
    ">
      {/* === АНИМИРОВАННЫЕ ФИГУРЫ === */}
      <div className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw] bg-white/20 rounded-full blur-3xl animate-float1" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-white/10 rounded-full blur-2xl animate-float2" />

      {/* === «Стеклянная» карточка авторизации === */}
      <div className="
        relative z-10 max-w-md w-full 
        bg-white/20 backdrop-blur-md
        border border-white/30
        rounded-3xl shadow-2xl
        p-8 flex flex-col items-center
        animate-fadeInScale
      ">
        <img src={shieldWithBolt} alt="Passkey" className="w-14 h-14 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Добро пожаловать в Passkey!
        </h1>
        <p className="text-gray-700 text-sm text-center mb-6">
          Войдите с помощью Keycloak и забудьте пароли
        </p>
        <button
          onClick={login}
          className="
            w-full py-3
            bg-gradient-to-r from-purple-500 to-indigo-600
            hover:from-purple-400 hover:to-indigo-500
            text-white font-semibold
            rounded-md shadow-md
            flex items-center justify-center gap-2
            transition-transform hover:-translate-y-0.5
          "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Войти через Keycloak</span>
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Нажимая кнопку, вы принимаете условия{" "}
          <a href="/terms" className="text-indigo-600 hover:text-purple-600 underline">
            пользовательского соглашения
          </a>.
        </p>
      </div>
    </div>
  );
}
