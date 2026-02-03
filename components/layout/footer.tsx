import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} GameStore. Все права защищены.
          </div>
          <nav className="flex items-center space-x-6">
            <Link
              href="/policy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Политика
            </Link>
            <Link
              href="/contacts"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Контакты
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
