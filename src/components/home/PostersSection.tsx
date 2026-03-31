import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function PostersSection() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <RevealOnScroll>
          <h3 className="text-xs font-extrabold tracking-[0.3em] uppercase text-secondary mb-4">
            Artistic Remembrance
          </h3>
        </RevealOnScroll>
        <RevealOnScroll>
          <h2 className="text-4xl md:text-5xl montserrat-light-caps text-carbon mb-12">
            POSZTEREK
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RevealOnScroll>
            <Link href="/termekek/origin-poszter" className="group block space-y-6">
              <Image
                src="https://lh3.googleusercontent.com/aida/ADBb0ui62JZ0Modhgr3Rvx-jrVd46l4W7gUJ258WQkWOTM4cKzKV72sNEfeXkXRt7EZ7GImFDGyWJg9oqJT_gGSz63j57KkUuGIT40JlvXXvUObDNaxDj3lMYnVH3_DnlQ9qet4L_ve4sdqsXCdoqk6C23W1HZzpOEbgYiD926S8nTuJje32rCSesS6pt9nHpg01cTZgKu7eGgr2nxzaRSzviFLebgtUA8qa-EX3PWr2-B4hT3M2SlqQYdJ-y6gDMsjfykL36qCF1kD87yI"
                alt="Origin series poster"
                width={800}
                height={1000}
                className="poster-tilt w-full h-auto rounded-2xl shadow-lg"
              />
              <p className="ethereal-title text-sm font-bold tracking-[0.2em] group-hover:text-[#4A4A4A] transition-colors">ORIGIN DESIGN</p>
            </Link>
          </RevealOnScroll>
          <RevealOnScroll>
            <Link href="/termekek/nova-poszter" className="group block space-y-6">
              <Image
                src="https://lh3.googleusercontent.com/aida/ADBb0ugsLiH96-uflIwjbRHSWCyTE7zJcSzbKeL5o1wbi9ojx0zWTJTqmaqV3Ar_OawOC5-5OCIDxmTa6dKPKZkoRCGPgj5cjU3Br68uHZ9gGRp7DJLWxuCGUzA1BE2Wc90sVgQoqMwOVdmjxJsUO62-ALhBH3BXFHS1HBVEi-D4O-3p0QKhunCVN46MNfuB8pZu72QmZo-XhXgDK6VZP1p3LcDqOI9S90Jf7OJzjRGillh_mI6GehYQLQv7G87TqH7-GFz0vfMW-RcCKk0"
                alt="Nova series poster"
                width={800}
                height={1000}
                className="poster-tilt w-full h-auto rounded-2xl shadow-lg"
              />
              <p className="ethereal-title text-sm font-bold tracking-[0.2em] group-hover:text-[#4A4A4A] transition-colors">NOVA DESIGN</p>
            </Link>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
