import { useEffect, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import ViewUserModal from "@/components/UI/ViewUserModal"

// import BasicLoading from "@/components/loading/BasicLoading";

// import powerups from "app/(site)/community/games/four-frogs/components/powerups";

// import games from "../constants/games";
const games = []

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";

const registeredGames = [
    'Four Frogs',
    'Race Game',
    'Eager Eagle',
    'Plinko',
    'Battle Trap',
    'Blackjack',
    'Ping Pong',
    'Tower Blocks',
    'Assets Gallery',
    'Tic Tac Toe',
    'Ocean Rings',
    'Maze',
    'School Run'
]

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    // const userReduxState = useSelector((state) => state.auth.user_details);
    const userReduxState = false

    const [showVideo, setShowVideo] = useState()

    useEffect(() => {

        if (!show.item) {
            setShow({
                ...show,
                item: games.find(game_obj => game_obj.name == show.game)
            })
        }

    }, [])

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Death Race Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column py-3">

                    <div className="px-3">

                        <div className="fw-bold mb-2">
                            Race to the end of the map before your opponents. Avoid being detected by the sniper by blending in with the NPC movements around you.
                        </div>

                        <div className="mb-2">
                            Runners - By holding the movement button periodically, runners can move across the map while trying to avoid being spotted by the sniper.
                        </div>

                        <div className="">
                            Snipers - With 3 bullets (adjustable in settings), snipers must carefully aim and time their shots to eliminate runners before they reach the end of the map. Choose your shots wisely, you need to spot the real players among the NPCs to successfully win the round.
                        </div>

                    </div>

                    <hr className="py-0" />

                    <div className="px-3 border-bottom">

                        <div className="mb-2 fw-bold">Inspiration</div>
                        <div className="mb-2">
                            Inspiration for Death Race came from an Xbox Arcade game back in the day. That game is also available on Steam if you want to check it out for yourself.
                        </div>

                        <div style={{ position: 'relative' }} className="mb-3">
                            <a 
                                href="https://store.steampowered.com/app/303590/Hidden_in_Plain_Sight/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Hidden in Plain Sight on Steam"
                            >
                                <img
                                    src={"img/hidden-in-plain-sight.webp"}
                                    style={{
                                        objectFit: "contain",
                                        width: "100%",
                                    }}
                                ></img>
                            </a>
                        </div>

                        <div className="inspiration-video-wrapper">

                            <div style={{ position: 'relative' }} className="ratio ratio-16x9 bg-dark">

                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${"y8ePjBtAVck"}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>

                            </div>

                        </div>


                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}