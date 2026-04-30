import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PawBreak Privacy Policy",
  description:
    "Privacy Policy for PawBreak, a digital wellbeing app for short breaks after selected app or phone usage.",
  alternates: {
    canonical: "https://tiramsiup.app/pawbreak/privacy-policy",
  },
};

const policySections = [
  {
    heading: "Developer and Contact",
    content: (
      <dl className="mt-4 grid gap-3 text-[15px] leading-7 text-[#4b5563] sm:grid-cols-[150px_1fr]">
        <dt className="font-semibold text-[#263126]">App:</dt>
        <dd>PawBreak</dd>
        <dt className="font-semibold text-[#263126]">Package name:</dt>
        <dd>com.pawbreak.android</dd>
        <dt className="font-semibold text-[#263126]">Privacy contact:</dt>
        <dd>
          <a className="font-semibold text-[#2e7d6e] underline-offset-4 hover:underline" href="mailto:chef@tiramsiup.app">
            chef@tiramsiup.app
          </a>
        </dd>
      </dl>
    ),
  },
  {
    heading: "Information PawBreak Accesses",
    content: (
      <>
        <p>
          PawBreak is designed to work primarily on your device. In the current version, PawBreak does not require an
          account and does not upload your app usage settings to our servers.
        </p>
        <p>PawBreak may access the following information on your device:</p>
        <ul>
          <li>Selected apps: the apps you choose PawBreak to monitor.</li>
          <li>Installed launcher apps: used to show an app picker so you can choose which apps should trigger breaks.</li>
          <li>
            App foreground usage information: accessed through Android Usage Access permission to detect when selected
            apps are being used and to count usage time.
          </li>
          <li>Break settings: usage duration, break duration, selected mascot, language preference, and related app rules.</li>
          <li>Local monitoring state: current usage counters, current break state, and whether monitoring is enabled.</li>
          <li>
            Notification permission status: used only to show PawBreak reminders or monitoring notifications when
            enabled.
          </li>
          <li>
            Overlay permission status: used to show the break screen over the selected app or during a phone-wide break.
          </li>
          <li>
            Purchase entitlement information: if in-app purchases are enabled, Google Play Billing is used to check
            whether an animal pack has been purchased. PawBreak does not collect or store your payment card details.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "How We Use This Information",
    content: (
      <ul>
        <li>Track usage time for apps you selected.</li>
        <li>Track total phone usage if you enable the phone-wide break setting.</li>
        <li>Show a break overlay when your configured limit is reached.</li>
        <li>Save your local rules and preferences.</li>
        <li>Show which animal/mascot is active.</li>
        <li>Restore access to purchased animal packs through Google Play Billing.</li>
      </ul>
    ),
  },
  {
    heading: "Data Sharing",
    content: (
      <>
        <p>PawBreak does not sell your data.</p>
        <p>
          In the current version, PawBreak does not send your app usage history, selected apps, break rules, or monitoring
          counters to our own servers.
        </p>
        <p>
          Payments and in-app purchases are processed by Google Play. Google may process purchase and payment information
          according to Google Play&apos;s own policies. PawBreak only receives the information needed to unlock purchased
          content in the app.
        </p>
      </>
    ),
  },
  {
    heading: "Data Storage and Retention",
    content: (
      <>
        <p>PawBreak stores settings and monitoring state locally on your device using Android local storage.</p>
        <p>This data remains on your device until:</p>
        <ul>
          <li>you reset data inside PawBreak, if that option is available;</li>
          <li>you clear app data from Android system settings; or</li>
          <li>you uninstall PawBreak.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Data Security",
    content: (
      <p>
        PawBreak limits access to data needed for its core break reminder functionality. Local settings and counters are
        stored in the app&apos;s private storage area on your Android device.
      </p>
    ),
  },
  {
    heading: "Permissions",
    content: (
      <>
        <p>PawBreak may ask for:</p>
        <ul>
          <li>Usage Access: to detect app usage time for selected apps and optional phone-wide usage limits.</li>
          <li>Display over other apps: to show the break overlay when a break starts.</li>
          <li>Notifications: to show monitoring and reminder notifications where supported.</li>
        </ul>
        <p>These permissions are used only for PawBreak&apos;s digital wellbeing and break reminder features.</p>
      </>
    ),
  },
  {
    heading: "Children",
    content: (
      <p>
        PawBreak is not intended to collect personal information from children. The app is designed as a digital wellbeing
        utility and does not require account registration in the current version.
      </p>
    ),
  },
  {
    heading: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy as PawBreak changes, especially if account login, cloud sync, analytics, or
        additional purchase features are added. The updated policy will be posted at the same public URL.
      </p>
    ),
  },
  {
    heading: "Contact",
    content: (
      <p>
        If you have questions about this Privacy Policy, contact us at{" "}
        <a className="font-semibold text-[#2e7d6e] underline-offset-4 hover:underline" href="mailto:chef@tiramsiup.app">
          chef@tiramsiup.app
        </a>
        .
      </p>
    ),
  },
];

export default function PawBreakPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] px-5 py-12 text-[#1f241f] sm:px-6 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2e7d6e]">PawBreak</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f241f] sm:text-5xl">
          PawBreak Privacy Policy
        </h1>
        <p className="mt-4 text-sm font-medium text-[#667085]">Effective date: April 30, 2026</p>
        <p className="mt-8 text-base leading-8 text-[#3f4a40]">
          PawBreak is a digital wellbeing app that helps you take short breaks after using selected apps or your phone
          for a configured amount of time.
        </p>
        <p className="mt-4 text-base leading-8 text-[#3f4a40]">
          This Privacy Policy explains what information PawBreak accesses, how it is used, and how you can contact us.
        </p>

        <div className="mt-10 space-y-8">
          {policySections.map((section) => (
            <section
              key={section.heading}
              className="border-b border-[#dde7dc] pb-8 last:border-b-0 last:pb-0"
            >
              <h2 className="text-[22px] font-bold leading-snug text-[#263126]">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-[15px] leading-8 text-[#4b5563] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
