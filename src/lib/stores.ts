import { writable } from "svelte/store";

interface ClockSettings {
	hour12: boolean;
	showTimezone: boolean;
}

export const clock = writable<ClockSettings>({
	hour12: true,
	showTimezone: false
});

interface Link {
	name: string;
	url: string;
}

interface LinkSection {
	title: string;
	links: Link[];
}

export const links = writable<LinkSection[]>([
	{
		title: "school",
		links: [
			{
				name: "ctls",
				url: "https://studentportal.educationincites.com/#/Home"
			},
			{
				name: "canvas",
				url: "https://canvas.instructure.com"
			},
			{
				name: "mastering",
				url: "https://portal.mypearson.com/course-home#/tab/active"
			},
			{
				name: "turnitin",
				url: "https://www.turnitin.com/s_home.asp"
			},
			{
				name: "vocab",
				url: "https://sadlierconnect.com/@1398082"
			},
			{
				name: "gavs",
				url: "https://gavirtual.instructure.com"
			},
			{
				name: "gt",
				url: "https://gatech.instructure.com"
			},
			{
				name: "studentvue",
				url: "https://studentvue.cobbk12.org"
			}
		]
	},
	{
		title: "stuff",
		links: [
			{
				name: "github",
				url: "https://github.com"
			},
			{
				name: "docs",
				url: "https://docs.google.com"
			},
			{
				name: "youtube",
				url: "https://youtube.com"
			},
			{
				name: "gmail",
				url: "https://gmail.com"
			}
		]
	}
]);

export const discordId = writable("299707523370319883");

export const weatherKey = writable("bc45eff71fbee692074aa888296c0490");
