import {Heading as AriaHeading, type HeadingProps} from 'react-aria-components/Heading';
import {Text as AriaText, type TextProps} from 'react-aria-components/Text';

export function Heading(props: HeadingProps) {
  return <AriaHeading {...props} />;
}

export function Text(props: TextProps) {
  return <AriaText {...props} />;
}
