import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaCheckDouble, FaEye, FaPeoplePulling } from "react-icons/fa6";
import { GiTeleport } from "react-icons/gi";
import { fetchNui } from "@/utils/fetchNui";
import { MdOutlineCarRepair } from "react-icons/md";
import "./App.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription } from "./ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "./ui/dropdown-menu";
import {
    TbBackpack, TbBinoculars, TbDots, TbJacket, TbLogout, TbMedicalCrossFilled, TbPackages, TbRibbonHealth, TbSettingsStar, TbSkull
} from "react-icons/tb";
import { IoCutSharp } from "react-icons/io5";
import { cn } from "@/lib/utils";

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
    viewers?: { id: string | number; name: string }[];
    seenBy?: { id: string | number; name: string }[];
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
    reportId: "",
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
];

const typeColors: Record<string, string> = {
    Bug: "bg-red-500/15 text-red-400 border-red-500/40",
    Question: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    Gameplay: "bg-purple-500/15 text-purple-400 border-purple-500/40",
};

const Reports: React.FC<Props> = ({ reports = [], myReports }) => {
    const [currReport, setCurrReport] = useState<Report>(initStateCurrReport);
    const [modalActive, setModalActive] = useState(false);
    const [messageQuery, setMessageQuery] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const openReport = (report: Report) => {
        setCurrReport({ ...initStateCurrReport, ...report });
        setModalActive(true);
        fetchNui("reportmenu:nuicb:openreport", { reportId: report.reportId });
    };

    const closeReport = () => {
        if (currReport?.reportId) {
            fetchNui("reportmenu:nuicb:closereport", { reportId: currReport.reportId });
        }
        setModalActive(false);
        setCurrReport(initStateCurrReport);
    };

    const copyToClipboard = (text: string, field: string) => {
        fetchNui("reportmenu:nuicb:copy", { text });
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 1000);
    };

    useEffect(() => {
        if (!modalActive) return;
        const updated = reports.find((r) => r.reportId === currReport.reportId);
        if (updated) {
            setCurrReport({ ...initStateCurrReport, ...updated });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currReport.messages]);

    const mergedViewers = useMemo(() => {
        const viewers = currReport.viewers ?? [];
        const seen = currReport.seenBy ?? [];
        return [
            ...viewers.map((v) => ({ ...v, active: true })),
            ...seen
                .filter((s) => !viewers.some((v) => v.id === s.id))
                .map((v) => ({ ...v, active: false })),
        ];
    }, [currReport]);

    return (
        <>
            <div className="w-full h-full overflow-auto bg-black/10 rounded-xl p-5">
                {reports.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        {myReports ? "You have no active reports." : "No Reports available."}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {reports.map((report) => (
                            <div
                                key={report.reportId}
                                onClick={() => openReport(report)}
                                className="relative cursor-pointer rounded-xl border border-border/40 bg-gradient-to-br from-background to-secondary/30 p-4 h-28 flex flex-col justify-between hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded bg-accent/20 border border-accent/40">
                                        {report.reportId}
                                    </span>
                                    <span className="font-semibold truncate">
                                        {report.title || "(no title)"}
                                    </span>
                                    <span
                                        className={cn(
                                            "ml-auto text-xs px-2 py-1 rounded border",
                                            typeColors[report.type] || "bg-gray-500/20 text-gray-300"
                                        )}
                                    >
                                        {report.type || "Unknown"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{report.playerName}</span>
                                    <span>{report.timedate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={modalActive} onOpenChange={closeReport}>
                <DialogContent
                    aria-describedby={undefined}
                    className="bg-black/70 backdrop-blur-xl border border-border/30 rounded-2xl max-w-4xl text-white"
                >
                    <DialogDescription className="hidden" />
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between pe-6">
                            <div className="flex gap-2">
                                <span
                                    className="text-xs px-3 py-[5px] rounded border bg-gray-500/20 text-gray-300">
                                    {currReport.reportId}
                                </span>
                                <h2 className="text-lg font-semibold">{currReport.title || 'aaa'}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "text-xs px-3 py-1 rounded border",
                                        typeColors[currReport.type] || "bg-gray-500/20 text-gray-300"
                                    )}
                                >
                                    {currReport.type || "Unknown"}
                                </span>
                                {!myReports && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <TbDots />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Player Zone</DropdownMenuLabel>
                                            {adminActions.map((action) => (
                                                <DropdownMenuItem
                                                    key={action.id}
                                                    onClick={() => {
                                                        fetchNui(action.action, currReport);
                                                        closeReport();
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        {action.icon}
                                                        {action.name}
                                                        <span className="ml-auto text-xs opacity-60">
                                                            {action.command}
                                                        </span>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 text-xs">
                            {[
                                { value: `${currReport.playerId} - ${currReport.playerName}`, key: "id" },
                                { value: currReport.playerDiscord, key: "discord" },
                                { value: currReport.playerLicense, key: "license" },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="bg-background/60 p-3 rounded-lg border border-border/30 flex justify-between items-center"
                                >
                                    <span className="truncate max-w-[80%] lowercase">{item.value}</span>
                                    <button
                                        onClick={() => copyToClipboard(item.value, item.key)}
                                        className="text-muted-foreground hover:text-green-400 text-[10px]"
                                    >
                                        {copiedField === item.key ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-background/60 p-4 rounded-lg border border-border/30">
                            <span className="ml-auto text-xs p-1 px-2 rounded border border-accent bg-accent/20 text-accent">
                                Message
                            </span>
                            <p className="text-xs mt-4">{currReport.description}</p>
                        </div>

                        <div className="bg-background/60 p-4 rounded-lg border border-border/30 h-64 overflow-auto flex flex-col gap-2">
                            {(currReport.messages ?? []).map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "max-w-[75%] p-2 rounded-xl text-xs",
                                        Number(msg.playerId) === Number(currReport.id)
                                            ? "bg-white/10 self-start"
                                            : "bg-emerald-900/40 self-end"
                                    )}
                                >
                                    <div className="flex justify-between text-[10px] opacity-70 mb-1 gap-1">
                                        <span>{msg.playerName} - {msg.timedate}</span>
                                    </div>
                                    {msg.data}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {mergedViewers.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs">
                                {mergedViewers.map((user) => (
                                    <span
                                        key={user.id}
                                        className={cn(
                                            "px-3 py-1 rounded-md flex items-center gap-1 border",
                                            user.active
                                                ? "bg-green-900/40 border-emerald-600 text-green-300"
                                                : "bg-neutral-800 border-neutral-600 text-gray-300"
                                        )}
                                    >
                                        {user.active ? <FaEye /> : <FaCheckDouble />} {user.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!messageQuery.trim()) return;
                                fetchNui("reportmenu:nuicb:sendmessage", {
                                    report: currReport,
                                    messageQuery,
                                });
                                setMessageQuery("");
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={messageQuery}
                                onChange={(e) => setMessageQuery(e.target.value)}
                                placeholder="Message..."
                                className="rounded-xl"
                            />
                            <Button type="submit" className="rounded-xl">
                                <FaCheck className="text-white" size={14} />
                            </Button>
                        </form>

                        <Button
                            onClick={() => {
                                fetchNui("reportmenu:nuicb:delete", {
                                    ...currReport,
                                    isMyReportsPage: myReports,
                                });
                                closeReport();
                            }}
                            className="text-white"
                        >
                            {myReports ? "Close Report" : "Conclude Report"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Reports;
