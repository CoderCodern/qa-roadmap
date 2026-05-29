import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/lesson/Quiz'
import { ExerciseBox } from '@/components/lesson/ExerciseBox'
import { Callout } from '@/components/lesson/Callout'
import { En, Vi } from '@/components/lesson/LangWrappers'
import { ResourceList } from '@/components/lesson/ResourceList'
import { CodeBlock } from '@/components/lesson/CodeBlock'
import { CodePlayground } from '@/components/lesson/CodePlayground'
import { CodeExerciseGroup } from '@/components/lesson/CodeExerciseGroup'
import { InstallGuide } from '@/components/lesson/InstallGuide'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
    Quiz,
    ExerciseBox,
    Callout,
    En,
    Vi,
    ResourceList,
    CodePlayground,
    CodeExerciseGroup,
    InstallGuide,
    ...components,
  }
}
