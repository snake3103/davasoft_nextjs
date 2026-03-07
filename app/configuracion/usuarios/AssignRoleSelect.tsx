"use client";

import { useState, useTransition } from "react";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { assignRoleToMember } from "@/app/actions/roles";

interface AssignRoleSelectProps {
    membershipId: string;
    currentRoleId: string;
    currentRoleName: string;
    availableRoles: { id: string; name: string }[];
}

export function AssignRoleSelect({ membershipId, currentRoleId, currentRoleName, availableRoles }: AssignRoleSelectProps) {
    const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newRoleId = e.target.value;
        setSelectedRoleId(newRoleId);
        setSaved(false);

        startTransition(async () => {
            const result = await assignRoleToMember(membershipId, newRoleId || null);
            if (result?.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        });
    }

    if (availableRoles.length === 0) {
        return (
            <span className="text-xs text-slate-400 italic">Sin roles disponibles</span>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <select
                value={selectedRoleId}
                onChange={handleChange}
                disabled={isPending}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-w-[140px] cursor-pointer disabled:opacity-50"
            >
                <option value="">— Sin rol —</option>
                {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                ))}
            </select>
            {isPending && <Loader2 size={16} className="animate-spin text-primary" />}
            {saved && <Check size={16} className="text-emerald-500" />}
        </div>
    );
}
