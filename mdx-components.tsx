import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/lesson/Quiz'
import { ExerciseBox } from '@/components/lesson/ExerciseBox'
import { Callout } from '@/components/lesson/Callout'
import { En, Vi } from '@/components/lesson/LangWrappers'
import { ResourceList } from '@/components/lesson/ResourceList'
import { CodeBlock } from '@/components/lesson/CodeBlock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
    Quiz,
    ExerciseBox,
    Callout,
    En,
    Vi,
    ResourceList,
    ...components,
  }
}
