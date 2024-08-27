import React, { useEffect, useState } from 'react'
import styles from './Rooms.module.css'
import RoomCard from '../../components/RoomCard/RoomCard'
import AddRoomModel from '../../components/AddRoomModel/AddRoomModel'
import { getAllRooms } from '../../http'
// const rooms=[
//   {
//     id:1,
//     topic:'Which framework best for frontend?',
//     speakers:[
//       {
//         id:1,
//         name:'John Doe',
//         avatar: '/images/monkey-avatar.png',
//       },
//       {
//         id:2,
//         name:'John Doe',
//         avatar:'/images/monkey-avatar.png',
//       },
//     ],
//     totalPeople: 40,
//   },
//   {
//     id:2,
//     topic:'Is Java dead??',
//     speakers:[
//       {
//         id:1,
//         name:'John Doe',
//         avatar: '/images/monkey-avatar.png',
//       },
//       {
//         id:2,
//         name:'John Doe',
//         avatar:'/images/monkey-avatar.png',
//       },
//     ],
//     totalPeople: 30,
//   }
// ]
const Rooms = () => {
  const [showModel, setShowmodel]=useState(false);
  const [rooms,setRooms]=useState([]);
  useEffect(()=>{
    const fetchRooms=async()=>{
      const {data}=await getAllRooms();
      setRooms(data);
    };
    fetchRooms();
  },[]);
  function openModel(){
    setShowmodel(true);
  }
  return (
    <>
      <div className='container'>
        <div className={styles.roomsHeader}>
          <div className={styles.left}>
            <span className={styles.heading}>
              All voice rooms !
            </span>
            <div className={styles.searchBox}>
              <img src='/images/search-icon.png' alt='search'/>
              <input type='text' className={styles.searchInput}/>
            </div>
          </div>
          <div className={styles.right}>
            <button onClick={openModel} className={styles.startRoomButton}>
              <img src='/images/add-room-icon.png' alt='add-room'/>
              <span>Start a Room!</span>
            </button>
          </div>
        </div>
        <div className={styles.roomList}>
          {rooms.map((room)=>(
            <RoomCard key={room.id} room={room}/>
          ))}
        </div>
      </div>
      {showModel && <AddRoomModel onClose={()=>setShowmodel(false)}/>}
    </>
  )
}

export default Rooms
