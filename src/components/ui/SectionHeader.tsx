import React from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
  headingLevel?: 'h1' | 'h2';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  subtitle,
  align = 'center',
  className,
  titleClassName,
  headingLevel = 'h2',
}) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  const HeadingTag = headingLevel;

  return (
    <div className={cn('flex flex-col', alignClass, className)}>
      {label && (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-[#1557B0] mb-3">
          {label}
        </span>
      )}
      <div className={cn('w-10 h-0.5 bg-[#1557B0] mb-4', align === 'center' ? 'mx-auto' : '')} />
      <HeadingTag
        className={cn(
          'text-3xl md:text-4xl font-bold text-[#1F2937] leading-tight',
          'font-serif',
          titleClassName
        )}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </HeadingTag>
      {subtitle && (
        <p className={cn('mt-4 text-base md:text-lg text-[#4B5563] leading-relaxed max-w-2xl', align === 'center' ? 'mx-auto' : '')}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
