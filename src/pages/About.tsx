import { Link } from "react-router-dom"
import { Compass, Globe2, Heart, ShieldCheck, Sparkles, Users } from "lucide-react"
import { SmartImage } from "../components/SmartImage"

const values = [
  { icon: ShieldCheck, title: "Trust First", body: "Every supplier is verified. Every price is transparent. No surprise fees, ever." },
  { icon: Sparkles, title: "Flexibility Always", body: "From one-click packages to fully custom itineraries — travel your way." },
  { icon: Heart, title: "Genuine Care", body: "Real people supporting your trip before, during, and after you travel." },
  { icon: Globe2, title: "Local + Global", body: "We champion small local experts alongside established global operators." },
]

const milestones = [
  { year: "2021", text: "Roamly founded with 12 local travel agency partners" },
  { year: "2022", text: "Crossed 5,000 happy travellers and 50 destinations" },
  { year: "2024", text: "Launched the custom Trip Builder — over 8,000 quotes generated" },
  { year: "2026", text: "200+ verified suppliers, 42,000+ travellers served" },
]

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ocean-950 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <Compass size={13} /> About Roamly
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            We believe planning a holiday should feel as good as taking one
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
            Roamly started with a simple frustration: booking a great holiday meant either settling for rigid
            packages or spending weeks coordinating with disconnected agents. So we built a single platform that
            brings together the best offline travel expertise and online convenience — fully flexible, fully
            transparent.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SmartImage
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80"
            alt="Team planning travel"
            className="aspect-[4/3] rounded-2xl"
          />
          <div>
            <h2 className="font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Our Mission</h2>
            <p className="mt-3 text-sm text-ocean-950/70 sm:text-base">
              To make every kind of holiday — beach, mountain, heritage, adventure, or once-in-a-lifetime
              honeymoon — accessible, transparent, and genuinely tailored, by connecting travellers directly with
              a curated network of trusted suppliers.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-ocean-50 p-4">
              <Users size={22} className="text-ocean-600" />
              <p className="text-sm text-ocean-950/80">
                <strong className="text-ocean-950">42,000+ travellers</strong> have booked through Roamly's network
                of 200+ verified suppliers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-display text-2xl font-bold text-ocean-950 sm:text-3xl">What We Stand For</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sunset-50 text-sunset-500">
                  <v.icon size={22} />
                </span>
                <h3 className="mb-1.5 font-display text-base font-bold text-ocean-950">{v.title}</h3>
                <p className="text-sm text-ocean-950/60">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-ocean-950 sm:text-3xl">Our Journey</h2>
        <div className="space-y-6">
          {milestones.map((m) => (
            <div key={m.year} className="flex gap-5">
              <span className="w-16 shrink-0 font-display text-lg font-bold text-ocean-600">{m.year}</span>
              <p className="border-l-2 border-sand-200 pl-5 text-sm text-ocean-950/70">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-ocean-950 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Want to plan your next trip with us?</h2>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/explore" className="rounded-full bg-sunset-500 px-6 py-3 text-sm font-bold text-white hover:bg-sunset-600">
              Browse Packages
            </Link>
            <Link to="/suppliers" className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
