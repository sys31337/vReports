import { Modal, ScrollArea, Menu, Text, Accordion } from "@mantine/core";
import React, { useState } from "react";
import { FaCheck, FaPeoplePulling, } from "react-icons/fa6";
import { GiTeleport } from "react-icons/gi";
import { debugData } from "@/utils/debugData";
import { fetchNui } from "@/utils/fetchNui";
import { IoIosSend } from "react-icons/io";
import { MdOutlineCarRepair, MdOutlineSocialDistance } from "react-icons/md";
import "./App.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { TbBackpack, TbBinoculars, TbBrandDiscord, TbDots, TbFileDescription, TbId, TbJacket, TbLicense, TbLogout, TbMedicalCrossFilled, TbPackages, TbRibbonHealth, TbSettingsStar, TbSkull, TbUser } from "react-icons/tb";
import { IoCutSharp } from "react-icons/io5";

const types = ["Bug", "Question", "Gameplay"];

const getCurrentDateTime = () => {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();

    const formattedDate = `${currentDate.getMonth() + 1
        }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

    const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

    return `${formattedTime} ${formattedDate}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testReports = Array.from({ length: 100 }, (_, index) => ({
    id: index,
    type: types[Math.floor(Math.random() * types.length)],
    description: "Very Very racist personeeeeeeeeeeeeeeeee!",
    playerName: `Test: ${index}`,
    timedate: getCurrentDateTime(),
    title: `Title ${index}`,
    nearestPlayers: [],
}));

export interface message {
    playerName: string;
    playerId: string | number;
    data: string;
    timedate: string;
}

export interface nearestPlayer {
    id: string | number;
    name: string | number;
    distance: string | number;
}

export interface Report {
    id: number | string;
    playerName: string;
    playerId: string;
    playerLicense: string;
    playerDiscord: string;
    type: "Bug" | "Question" | "Gameplay" | "";
    description: string;
    timedate: string;
    title: "";
    nearestPlayers?: nearestPlayer[];
    messages: message[];
    reportId: string;
}

const initStateCurrReport: Report = {
    id: 0,
    playerName: "",
    playerId: "",
    playerLicense: "",
    playerDiscord: "",
    type: "",
    description: "",
    timedate: "",
    title: "",
    messages: [],
    reportId: "A1",
};

interface Props {
    reports: Report[];
    myReports: boolean;
}

const adminActions = [
    { id: 1, name: "Goto", icon: <GiTeleport size={14} />, command: "/goto", action: "reportmenu:nuicb:goto" },
    { id: 2, name: "Bring", icon: <FaPeoplePulling size={14} />, command: "/bring", action: "reportmenu:nuicb:bring" },
    { id: 3, name: "Revive", icon: <TbMedicalCrossFilled size={14} />, command: "/revive", action: "reportmenu:nuicb:revive" },
    { id: 4, name: "Heal", icon: <TbRibbonHealth size={14} />, command: "/heal", action: "reportmenu:nuicb:heal" },
    { id: 5, name: "Kill", icon: <TbSkull size={14} />, command: "/kill", action: "reportmenu:nuicb:kill" },
    { id: 6, name: "Spectate", icon: <TbBinoculars size={14} />, command: "/spectate", action: "reportmenu:nuicb:spectate" },
    { id: 7, name: "Inventory", icon: <TbBackpack size={14} />, command: "/pinv", action: "reportmenu:nuicb:inventory" },
    { id: 8, name: "Stash", icon: <TbPackages size={14} />, command: "/stash", action: "reportmenu:nuicb:stash" },
    { id: 9, name: "Fix vehicle", icon: <MdOutlineCarRepair size={14} />, command: "/fix", action: "reportmenu:nuicb:fix" },
    { id: 10, name: "Clothing", icon: <TbJacket size={14} />, command: "/clothingmenu", action: "reportmenu:nuicb:clothing" },
    { id: 11, name: "Outfits", icon: <TbJacket size={14} />, command: "/outfits", action: "reportmenu:nuicb:outfits" },
    { id: 12, name: "Barber", icon: <IoCutSharp size={14} />, command: "/barber", action: "reportmenu:nuicb:barber" },
    { id: 13, name: "Register", icon: <TbSettingsStar size={14} />, command: "/register", action: "reportmenu:nuicb:register" },
    { id: 14, name: "Logout", icon: <TbLogout size={14} />, command: "/logout", action: "reportmenu:nuicb:logout" },
]
const Reports: React.FC<Props> = ({ reports, myReports }) => {
    const [currReport, setCurrReport] = useState<Report>(initStateCurrReport);
    const [modalActive, setModalActive] = useState(false);
    const [messageQuery, setMessageQuery] = useState("");
    const openReport = (report: Report) => {
        setCurrReport(report);
        setModalActive(true);
    }
    debugData([
        {
            action: "nui:state:reports",
            data: testReports,
        },
    ]);

    return (
        <>
            <ScrollArea className="w-full h-full backdrop-filter backdrop-blur-xl bg-black/10 rounded-xl">
                <div className="grid grid-cols-1 m-5 sm:grid-cols-2 gap-4 md:grid-cols-3">
                    {reports.length !== 0 ? (
                        <>
                            {Object.values(reports).map((report, index) => {
                                if (!report) return console.log("[DEBUG] (Reports/map) report is null");
                                return (
                                    <div
                                        key={index}
                                        onClick={() => openReport(report)}
                                        className="flex hover:cursor-pointer transition-all select-none flex-col p-2 h-20 justify-between hover:scale-105 backdrop-filter backdrop-blur-xl bg-black/20 rounded-xl text-white"
                                    >
                                        <p className="flex items-center">
                                            <span className="truncate max-w-[100px] text-sm">
                                                {report.title}
                                            </span>
                                            <span className="ml-auto bg-black/20 font-main rounded-full px-3 font-thin text-xs py-1 backdrop-filter backdrop-blur-xl">
                                                {report.type}
                                            </span>
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <p className="text-xs rounded-[2px] text-white bg-background text-opacity-50 backdrop-filter backdrop-blur-xl">
                                                {report.reportId}
                                            </p>
                                            <p className="ml-auto rounded-[2px] bg-background px-2 font-main text-xs opacity-50 backdrop-filter backdrop-blur-xl">
                                                {report.timedate}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <div className="font-main">
                                {myReports ? "You have no active reports." : "No Reports available."}
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
            <Modal
                opened={modalActive}
                centered
                size={"lg"}
                onClose={() => {
                    setModalActive(false);
                    setCurrReport(initStateCurrReport);
                }}
                classNames={{ content: "bg-black/80 rounded-2xl", }}
                withCloseButton={false}
            >
                <div className="flex flex-col gap-1 justify-center rounded-2xl backdrop-filter backdrop-blur-xl bg-black/20">
                    <div className="flex m-2 font-main text-white">
                        <p>{currReport.title}</p>
                        <div className="ml-auto flex gap-2 justify-center items-center">
                            <p className="backdrop-filter backdrop-blur-xl bg-red-800/20 rounded-lg p-1 px-3 text-sm">{currReport.reportId}</p>
                            <p className="backdrop-filter backdrop-blur-xl bg-red-500/20 rounded-lg p-1 px-3 text-sm">{currReport.type}</p>
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Button className="bg-black/0 rounded-2xl outline-none focus-within:outline-none">
                                        <TbDots />
                                    </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {!myReports && (
                                        <>
                                            <Menu.Label>Player Zone</Menu.Label>
                                            {adminActions.map((action) => (
                                                <Menu.Item
                                                    key={action.id}
                                                    leftSection={action.icon}
                                                    rightSection={<Text size="xs" c="dimmed">{action.command}</Text>}
                                                    onClick={() => {
                                                        fetchNui(action.action, currReport);
                                                        setCurrReport(initStateCurrReport);
                                                        setModalActive(false);
                                                    }}
                                                >{action.name}</Menu.Item>
                                            ))}
                                        </>
                                    )}
                                </Menu.Dropdown>
                            </Menu>
                        </div>
                    </div>
                    <div className="rounded py-1 px-2 flex flex-col gap-2 justify-center">
                        <div className="flex gap-2 items-center">
                            <p className="text-white font-main flex gap-2 items-center"><TbUser />  Player Name:</p>
                            <p className="font-main">{currReport.playerName}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <p className="text-white font-main flex gap-2 items-center"><TbId /> Player ID:</p>
                            <p className="font-main">{currReport.playerId}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <p className="text-white font-main flex gap-2 items-center"> <TbBrandDiscord /> Player Discord:</p>
                            <p className="font-main">{currReport.playerDiscord}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <p className="text-white font-main flex gap-2 items-center"> <TbLicense /> Player License:</p>
                            <p className="font-main">{currReport.playerLicense?.replace('license:', '')}</p>
                        </div>
                        <p className="text-white font-main flex gap-2 items-center">
                            <TbFileDescription /> Report Description
                        </p>
                        {currReport.description}

                        {currReport.messages && (
                            <>
                                <p className="text-white font-main">
                                    Report Messages
                                </p>
                                <ScrollArea className="h-[20dvh] bg-background border-[2px]">
                                    <div className="flex flex-col gap-2">
                                        {currReport.messages.map(
                                            (message, index) => (
                                                <>
                                                    <div
                                                        key={index}
                                                        className="bg-secondary py-1 px-2 m-2 rounded-[2px] border-[2px]"
                                                    >
                                                        <div className="flex items-center justify-center font-main">
                                                            <span className="text-white">
                                                                {
                                                                    message.playerName
                                                                }{" "}
                                                                (ID -{" "}
                                                                {
                                                                    message.playerId
                                                                }
                                                                ):
                                                            </span>
                                                            <span className="ml-1 max-w-[240px] break-words">
                                                                {message.data}
                                                            </span>
                                                            <p className="ml-auto bg-background px-2 py-1 flex justify-center items-center gap-1 border-[2px] font-main opacity-50 text-xs">
                                                                {
                                                                    message.timedate
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        )}
                                    </div>
                                </ScrollArea>
                            </>
                        )}

                        {!!currReport.nearestPlayers && currReport.nearestPlayers?.length > 0 && (
                            <>
                                <p className="text-white font-main">
                                    Nearest Players
                                </p>
                                <ScrollArea className="max-h-[30dvh] bg-background border-[2px]">
                                    <div className=" py-4 px-4 rounded-[2px] gap-2 grid grid-cols-4 font-mwwwwwwwwwwwain text-sm">
                                        {currReport.nearestPlayers.length > 0 &&
                                            currReport.nearestPlayers.map(
                                                (player, index) => (
                                                    <>
                                                        <div
                                                            key={index}
                                                            className="bg-secondary py-1 px-2 flex items-center"
                                                        >
                                                            <div className="p-1 flex items-center text-white">
                                                                [{player.id}]{" "}
                                                                <p className="ml-1 truncate max-w-[50px]">
                                                                    {
                                                                        player.name
                                                                    }
                                                                </p>
                                                            </div>
                                                            <p className="ml-auto flex items-center bg-background rounded-[2px] px-1">
                                                                <MdOutlineSocialDistance className="mr-1" />{" "}
                                                                {
                                                                    player.distance
                                                                }
                                                            </p>
                                                        </div>
                                                    </>
                                                )
                                            )}
                                    </div>
                                </ScrollArea>
                            </>
                        )}
                        <Accordion className="mt-2" variant="separated">
                            <Accordion.Item value="reply">
                                <Accordion.Control className="outline-none focus:outline-none " icon={<IoIosSend />}>Reply</Accordion.Control>
                                <Accordion.Panel>
                                    <form
                                        className="flex items-center gap-1"
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            const data = {
                                                report: currReport,
                                                messageQuery: messageQuery,
                                            };

                                            fetchNui("reportmenu:nuicb:sendmessage", data);
                                            setModalActive(false);
                                            setCurrReport(initStateCurrReport);
                                            setMessageQuery("");
                                        }}
                                    >
                                        <Input
                                            className="w-full focus:!ring-1"
                                            value={messageQuery}
                                            onChange={(e) => {
                                                setMessageQuery(e.target.value);
                                            }}
                                            placeholder="Message..."
                                        />
                                        <Button
                                            type="submit"
                                            className="border-[2px] p-4 rounded-[2px] bg-background h-[36px] text-white"
                                        >
                                            <FaCheck size={16} strokeWidth={2.5} />
                                        </Button>
                                    </form>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                        <Button
                            className="flex gap-2"
                            onClick={() => {
                                const data = {
                                    ...currReport,
                                    isMyReportsPage: myReports,
                                };

                                fetchNui("reportmenu:nuicb:delete", data);
                                setModalActive(false);
                                setCurrReport(initStateCurrReport);
                            }}>
                            <FaCheck size={14} />
                            {myReports ? "Close" : "Conclude"} Report
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Reports;
