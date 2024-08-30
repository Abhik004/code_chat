import { useState } from "react";
import { useStateWithCallback } from "./useStateWithCallback";
import { useRef } from "react";

const users=[
        {
           id:1,
           name:'Rakesh K'
        },
        {
           id:2,
           name:'John Doe'
        }
];

export const useWebRTC=(roomId,user)=>{
   const [clients,setClients]=useStateWithCallback(users);
   const audioElements=useRef({});
   const connections=useRef({});
   const localMediaStream=useRef(null);

   return {clients};
};