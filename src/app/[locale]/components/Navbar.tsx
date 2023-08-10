"use client";
import React, { useState, useEffect } from "react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from 'next/link'


export const Navbar = () => {
	const [overlay, setOverlay] = useState(false);
	const t = useTranslations("Navigation");

	return (
		<div className="fixed top-0 left-0 right-0 bg-white p-8 pb-4 z-50">
			<div className="z-50 relative inline-block">
				<Image
					src="/impact-stream-logo.svg"
					alt="Impact Stream"
					width={114}
					height={45}
					priority
				/>
			</div>
			{overlay && (
				<nav className="brand-bg-color text-3xl font-bold fixed top-0 bottom-0 right-0 left-0 p-10 pt-28 z-40">
					<ul>
						<li className="mb-6">
              <Link href="/proposals">{t("link1")}</Link>
						</li>
						<li className="mb-6">
              <Link href="/settings">{t("link2")}</Link>
						</li>
					</ul>
					<XMarkIcon
						onClick={() => setOverlay(false)}
						className="h-8 absolute right-12 top-10"
					/>
				</nav>
			)}
			{!overlay && (
				<div onClick={() => setOverlay(true)}>
					<Bars3Icon className="h-8 absolute right-12 top-10" />
				</div>
			)}
		</div>
	);
};
