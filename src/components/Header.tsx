import { Separator } from "@/components/ui/separator"
import { ToggleTheme } from "./ToggleTheme"
import { auth, signOut } from "@/auth"
import { getMe } from "@/actions/user"

export default async function Header() {
  const session = await auth()
  const user = session ? await getMe() : null
  const userWorldCell = user?.worldCell

  console.log('✨ userWorldCell', userWorldCell)

  return (
    <header className="bg-background w-full pt-5 px-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-4xl font-[family-name:var(--font-rubik-dirt)]">
          {userWorldCell?.title || "Un Désert"}
        </h1>

        <div className="flex items-center gap-2">
          {session && (
            <div className="flex items-center gap-2 text-sm">
              <p>{session.user?.name}</p>
              <form action={async () => {
                "use server"

                await signOut()
              }}>
                <button
                  type="submit"
                  className="text-sm underline cursor-pointer"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
          <ToggleTheme />
        </div>
      </div>
      <Separator className="w-full" />
    </header>
  )
}