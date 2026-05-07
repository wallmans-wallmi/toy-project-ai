"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortalCustomerProfile } from "@/lib/portal/types";

type PortalPersonalFormsProps = {
  profile: PortalCustomerProfile;
  userId: string;
  saveProfile: (patch: Partial<PortalCustomerProfile>, userId: string) => Promise<{ ok: boolean }>;
  onSaved: () => void;
};

export function PortalPersonalForms({ profile, userId, saveProfile, onSaved }: PortalPersonalFormsProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [streetName, setStreetName] = useState(profile.streetName);
  const [houseNumber, setHouseNumber] = useState(profile.houseNumber);
  const [apartmentNumber, setApartmentNumber] = useState(profile.apartmentNumber);
  const [floor, setFloor] = useState(profile.floor);
  const [doorCode, setDoorCode] = useState(profile.doorCode);
  const [addressNotes, setAddressNotes] = useState(profile.addressNotes);
  const [pickupCity, setPickupCity] = useState(profile.pickupCity);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setStreetName(profile.streetName);
    setHouseNumber(profile.houseNumber);
    setApartmentNumber(profile.apartmentNumber);
    setFloor(profile.floor);
    setDoorCode(profile.doorCode);
    setAddressNotes(profile.addressNotes);
    setPickupCity(profile.pickupCity);
  }, [profile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNote(null);
    const r = await saveProfile(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        streetName: streetName.trim(),
        houseNumber: houseNumber.trim(),
        apartmentNumber: apartmentNumber.trim(),
        floor: floor.trim(),
        doorCode: doorCode.trim(),
        addressNotes: addressNotes.trim(),
        pickupCity: pickupCity.trim(),
      },
      userId,
    );
    setSaving(false);
    setNote(r.ok ? "השינויים נשמרו" : "לא ניתן לשמור, נסו שוב");
    if (r.ok) onSaved();
  };

  return (
    <form className="space-y-8" onSubmit={(e) => void onSubmit(e)} dir="rtl" lang="he">
      <fieldset className="space-y-4 rounded-2xl border border-violet-100 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-[#9333EA]">פרטים אישיים</legend>
        <p className="text-xs text-slate-500">מספר הטלפון מגיע ממערכת ההתחברות ולא ניתן לעריכה כאן</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-first">שם פרטי</Label>
            <Input id="pf-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-last">שם משפחה</Label>
            <Input id="pf-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-email">מייל</Label>
          <Input
            id="pf-email"
            type="email"
            dir="ltr"
            className="rounded-xl text-end"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>טלפון (לצפייה בלבד)</Label>
          <Input readOnly dir="ltr" className="rounded-xl bg-slate-50 text-end" value={profile.phone} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-violet-100 bg-white p-5">
        <legend className="px-1 text-sm font-bold text-[#9333EA]">כתובת לאיסוף ומשלוח</legend>
        <div className="space-y-2">
          <Label htmlFor="pf-city">עיר</Label>
          <Input id="pf-city" value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} className="rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pf-street">שם רחוב</Label>
            <Input id="pf-street" value={streetName} onChange={(e) => setStreetName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-house">מספר בית</Label>
            <Input id="pf-house" dir="ltr" className="rounded-xl text-end" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-apt">דירה</Label>
            <Input id="pf-apt" dir="ltr" className="rounded-xl text-end" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-floor">קומה</Label>
            <Input id="pf-floor" dir="ltr" className="rounded-xl text-end" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-code">קוד כניסה</Label>
            <Input id="pf-code" dir="ltr" className="rounded-xl text-end" value={doorCode} onChange={(e) => setDoorCode(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-notes">הערות לכתובת</Label>
          <Textarea id="pf-notes" rows={3} className="rounded-xl" value={addressNotes} onChange={(e) => setAddressNotes(e.target.value)} />
        </div>
      </fieldset>

      {note ? <p className="text-sm text-slate-700">{note}</p> : null}

      <Button type="submit" className="rounded-xl bg-[#9333EA] text-white hover:bg-[#7c3aed]" disabled={saving}>
        {saving ? "שומרים…" : "שמירת שינויים"}
      </Button>
    </form>
  );
}
