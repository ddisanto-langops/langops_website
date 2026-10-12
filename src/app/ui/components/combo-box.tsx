import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
  Input,
  Button,
  type ListBoxItemProps,
  type ListBoxProps,
  type ValidationResult
} from 'react-aria-components'; // Cleaned up imports to core module
import { Label, FieldError, Description } from './form';
import { DropdownItem, DropdownListBox } from './list-box';
import { Popover } from './popover';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/lib/filter.module.css';

export interface ComboBoxProps<T, M extends 'single' | 'multiple'> extends Omit<
  AriaComboBoxProps<T, M>,
  'children'
> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
  placeholder?: string;
}

export function ComboBox<T, M extends 'single' | 'multiple' = 'single'>({
  label,
  description,
  errorMessage,
  children,
  placeholder,
  ...props
}: ComboBoxProps<T, M>) {
  return (
    <AriaComboBox {...props} className={styles.comboBoxContainer}>
      {label && <Label>{label}</Label>}
      
      {/* Visual input wrapper bar */}
      <div className={styles.inputWrapper}>
        <Input className={styles.input} placeholder={placeholder} />
        <Button className={styles.fieldButton}>
          <ChevronDown className={styles.chevron} />
        </Button>
      </div>

      {props.selectionMode === 'multiple' && (
        <ComboBoxValue className={styles.valuesSummary} placeholder="No items selected" />
      )}
      
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      
      <Popover className={styles.popover}>
        <ComboBoxListBox>{children}</ComboBoxListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxListBox<T>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} className={styles.listBox} />;
}


export function ComboBoxItem(props: ListBoxItemProps) {
  return (
    <DropdownItem 
      {...props} 
      className={({ isFocused, isSelected, isDisabled }) => `
        ${styles.item}
        ${isFocused ? styles.itemFocused : ''}
        ${isSelected ? styles.itemSelected : ''}
        ${isDisabled ? styles.itemDisabled : ''}
      `}
    />
  );
}