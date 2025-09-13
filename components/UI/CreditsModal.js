import { useEffect, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import ArticlesButton from "./Button";
import Link from "next/link";

export default function CreditsModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

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
                    <Modal.Title>Credits</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-3">

                    <h4 className="mb-4">View the code!</h4>

                    <h6 className="mb-2">
                        Developer: Articles-Joey
                    </h6>

                    <Link href="https://github.com/articles-joey/death-race" target="_blank" rel="noopener noreferrer">
                        <ArticlesButton
                            size="lg"
                        >
                            <i className="fab fa-github me-2"></i>
                            <span>View on Github</span>
                        </ArticlesButton>
                    </Link>

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