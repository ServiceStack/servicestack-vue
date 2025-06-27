// Vue Component Type Definitions
import type { Component, DefineComponent, EmitsOptions, StyleValue } from 'vue'
import type { Apis } from '../use/metadata'
import type { 
  ResponseStatus, MetadataOperationType, InputProp, TableStyleOptions, Breakpoint, ApiRequest, MetadataType, 
  InputInfo, AutoQueryConvention, ApiPrefs, GridAllowOptions, GridShowOptions, MetadataPropertyType, 
  ApiResponseType, UploadedFile, ImageInfo, MarkdownInputOptions, RefInfo, FormatInfo, Column, AuthenticateResponse 
} from '@/types'

// Input Components
export interface TextInputProps {
  status?: ResponseStatus|null
  id: string      
  type?: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  placeholder?: string
  modelValue?: string|number
}
export interface TextInputExpose {
  focus(): void
}

export interface TextareaInputProps {
  status?: ResponseStatus|null
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  placeholder?: string
  modelValue?: string
}

export interface SelectInputProps {
  status?: ResponseStatus
  id: string
  modelValue?: string
  inputClass?: string
  label?: string
  labelClass?: string
  options?: any
  values?: string[]
  entries?: { key:string, value:string }[]
}

export type EmitsUpdateModelValue<T> = {
  (e: "update:modelValue", value:T): void
}
export type EmitsSuccess = {
  (e:'success', response:any): void
}
export type EmitsSave = {
  (e:'save', response:any): void
}
export type EmitsDelete = {
  (e:'delete', response:any): void
}
export type EmitsError = {
  (e:'error', error:ResponseStatus): void
}
export type EmitsDone = {
  (e:'done'): void
}
export type EmitsClose = {
  (e:'close'): void
}

export interface CheckboxInputProps {
  modelValue?: boolean
  status?: ResponseStatus
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
}
export type CheckboxInputEmits = EmitsUpdateModelValue<boolean>

export interface FileInputProps {
  multiple?: boolean
  status?: ResponseStatus|null
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  placeholder?: string
  modelValue?: string
  values?:string[]
  files?:UploadedFile[]
}

// Button Components
export interface PrimaryButtonProps { 
  type?: "submit" | "button" | "reset"
  href?: string
  color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}

export interface SecondaryButtonProps { 
  type?: "submit" | "button" | "reset"
  href?: string 
}

export interface OutlineButtonProps { 
  type?: "submit" | "button" | "reset"
  href?: string 
}

// Form Components
export interface AutoFormProps {
    type: string|InstanceType<any>|Function
    modelValue?: ApiRequest|any
    heading?: string
    subHeading?: string
    showLoading?: boolean
    jsconfig?: string
    formStyle?: "slideOver" | "card"
    metaType?: MetadataType
    configureField?: (field:InputProp) => void
    configureFormLayout?: (field:InputProp[]) => void

    panelClass?: string
    bodyClass?: string
    formClass?: string
    innerFormClass?: string
    headerClass?: string
    buttonsClass?: string
    headingClass?: string
    subHeadingClass?: string
    submitLabel?: string
    allowSubmit?: (model:any) => boolean
}

export type AutoFormEmits = EmitsSuccess & EmitsError & EmitsDone & EmitsUpdateModelValue<any>

export interface AutoFormBaseProps {
  type: string|InstanceType<any>|Function
  formStyle?: "slideOver" | "card"
  panelClass?: string
  formClass?: string
  headingClass?: string
  subHeadingClass?: string
  buttonsClass?: string,
  heading?: string
  subHeading?: string
  autosave?: boolean
  showLoading?: boolean,
  showCancel?: boolean
  configureField?: (field:InputProp) => void
  configureFormLayout?: (field:InputProp[]) => void
}

export interface AutoCreateFormProps extends AutoFormBaseProps {
  // Inherits all AutoFormProps
}
export type AutoCreateFormEmits = EmitsDone & EmitsSave & EmitsError

export interface AutoEditFormProps extends AutoFormBaseProps {
  modelValue: any
  deleteType?: string|InstanceType<any>|Function
}
export type AutoEditFormEmits = EmitsDone & EmitsSave & EmitsDelete & EmitsError


export interface AutoViewFormProps {
  model: any
  apis?: Apis,
  typeName?: string,
  done?: Function,
  formStyle?: "slideOver" | "card"
  panelClass?: string
  formClass?: string
  headingClass?: string
  subHeadingClass?: string
  heading?: string
  subHeading?: string
  showLoading?: boolean
  deleteType?: string|InstanceType<any>|Function
}
export type AutoViewFormEmits = EmitsDone & EmitsSave & EmitsDelete & EmitsError

// Additional Input Components
export interface TagInputProps {
  status?: ResponseStatus|null
  id: string
  type?: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  modelValue?: string|string[]
  delimiters?: string[]
  allowableValues?: string[]
  string?: boolean
  maxVisibleItems?: number
  converter?: (value:any) => string|string[]
}
export type TagInputEmits = EmitsUpdateModelValue<string|string[]>

export interface AutocompleteProps {
  status?: ResponseStatus|null
  id: string
  type?: string
  label?: string
  help?: string
  placeholder?: string
  multiple?: boolean
  required?: boolean
  options?: any[]
  modelValue?: any
  match:(item:any,value:string) => boolean
  viewCount?: number
  pageSize?: number
}
export type AutocompleteEmits = EmitsUpdateModelValue<any[]|any>

export interface ComboboxProps {
    id: string
    modelValue?: any,
    multiple?: boolean,
    options?: any
    values?: string[]
    entries?: { key:string, value:string }[],
}
export type ComboboxEmits = EmitsUpdateModelValue<any[]|any>

export interface ComboboxExpose { 
  toggle(expand:boolean): void
}

export interface DynamicInputProps {
  input: InputProp|InputInfo
  modelValue: ApiRequest
  api: ApiResponseType|null
}
export type DynamicInputEmits = EmitsUpdateModelValue<any>

export interface LookupInputProps {
  id?: string
  status?: ResponseStatus|null
  input: InputProp|InputInfo
  metadataType: MetadataType
  modelValue: any
  label?: string
  labelClass?: string
  help?: string
}
export type LookupInputEmits = EmitsUpdateModelValue<any>

// Grid Components
export interface DataGridProps {
    items: any[]
    id?: string
    type?: string|InstanceType<any>|Function
    tableStyle?: TableStyleOptions
    selectedColumns?:string[]|string
    gridClass?: string
    grid2Class?: string
    grid3Class?: string
    grid4Class?: string
    tableClass?: string
    theadClass?: string
    tbodyClass?: string
    theadRowClass?: string
    theadCellClass?: string
    isSelected?:(row:any) => boolean
    headerTitle?:(name:string) => string
    headerTitles?: {[name:string]:string}
    visibleFrom?: {[name:string]:Breakpoint|"never"}
    rowClass?:(model:any,i:number) => string
    rowStyle?:(model:any,i:number) => StyleValue | undefined
}

export interface DataGridEmits {
    (e:"headerSelected", name:string, ev:Event): void
    (e:"rowSelected", item:any, ev:Event): void
}

export interface AutoQueryGridProps {
    filterDefinitions?: AutoQueryConvention[]
    id?: string
    apis?: string|string[]
    type?: string|InstanceType<any>|Function
    prefs?: ApiPrefs

    deny?: string|GridAllowOptions|GridAllowOptions[]
    hide?: string|GridShowOptions|GridShowOptions[]
    
    selectedColumns?:string[]|string
    toolbarButtonClass?: string
    tableStyle?: TableStyleOptions
    gridClass?: string
    grid2Class?: string
    grid3Class?: string
    grid4Class?: string
    tableClass?: string
    theadClass?: string
    tbodyClass?: string
    theadRowClass?: string
    theadCellClass?: string

    headerTitle?:(name:string) => string
    headerTitles?: {[name:string]:string}
    visibleFrom?: {[name:string]:Breakpoint|"never"}
    rowClass?:(model:any,i:number) => string
    rowStyle?:(model:any,i:number) => StyleValue | undefined
    modelTitle?: string
    newButtonLabel?: string

    apiPrefs?: ApiPrefs
    canFilter?:(column:string) => boolean
    disableKeyBindings?:(column:string) => boolean
    configureField?: (field:InputProp) => void
    skip?: number
    create?: boolean
    edit?: string|number
    filters?: any
}
export interface AutoQueryGridEmits {
    (e: "headerSelected", name:string, ev:Event): void
    (e: "rowSelected", item:any, ev:Event): void
    (e: "nav", args:any): void
}

// Modal Components
export interface ModalDialogProps {
  id?: string
  modalClass?: string
  sizeClass?: string
  closeButtonClass?: string
  configureField?: (field:InputProp) => void
}
export type ModalDialogEmits = EmitsDone

export interface SlideOverProps {
  id?: string
  title?: string
  contentClass?: string
}
export type SlideOverEmits = EmitsDone

// Navigation Components
export interface BreadcrumbsProps {
  homeHref?: string
  homeLabel?: string
}

export interface BreadcrumbProps {
  href?: string
  title?: string
}

// Utility Components
export interface LoadingProps {
  imageClass?: string
}

export interface IconProps {
  image?: ImageInfo
  svg?: string
  src?: string
  alt?: string
  type?: string
}

export interface AlertProps {
    type?: "warn" | "info" | "error" | "success",
    hideIcon?: boolean
}

export interface AlertSuccessProps {
    message?: string
}

export interface ErrorSummaryProps {
  status?: ResponseStatus|undefined,
  except?: string | string[]
  class?: string
}

// Form Components
export interface AutoFormFieldsProps {
  modelValue: ApiRequest
  type?: string
  metaType?: MetadataType
  api: {error?:ResponseStatus}|null
  formLayout?: InputInfo[]
  configureField?: (field:InputProp) => void
  configureFormLayout?: (field:InputProp[]) => void
  hideSummary?: boolean
  flexClass?: string
  divideClass?: string
  spaceClass?: string
  fieldsetClass?: string
}
export type AutoFormFieldsEmits = EmitsUpdateModelValue<any>

export interface ConfirmDeleteProps {
}
export interface ConfirmDeleteEmits {
  (e:'delete'): void
}

export interface FormLoadingProps {
  icon?: boolean
  text?: string
}

// Format Components
export interface CellFormatProps {
  type: MetadataType,
  propType: MetadataPropertyType,
  modelValue: Object
}

export interface PreviewFormatProps {
  value: any
  format?:FormatInfo
  includeIcon?: boolean
  includeCount?: boolean
  maxFieldLength?: number
  maxNestedFields?: number
  maxNestedFieldLength?: number
}

export interface HtmlFormatProps {
  value?: any,
  depth?: number
  fieldAttrs?: (k:string) => any
  classes?: (type:'object'|'array',tag:'div'|'table'|'thead'|'th'|'tr'|'td',depth:number,cls:string,index?:number) => string
}

export interface MarkupFormatProps {
  value: any,
  imageClass?: string
}

export interface MarkupModelProps {
  value: any,
  imageClass?: string
}

// Additional Components
export interface InputDescriptionProps {
  id: string
  description: string
}

export interface TextLinkProps {
  color?: "blue" | "purple" | "red" | "green" | "sky" | "cyan" | "indigo"
}

export interface NavListProps {
  title?: string
}

export interface NavListItemProps {
  title: string
  href: string
  icon?: ImageInfo
  iconSvg?: string
  iconSrc?: string
  iconAlt?: string
}

export interface SettingsIconsProps {
  column: Column
  isOpen: boolean
}

export interface FilterViewsProps {
  definitions?: any[]
  columns?: any[]
}

export interface FilterColumnProps {
  definition?: any
  column?: any
}

export interface QueryPrefsProps {
  columns?: any[]
  prefs?: any
}

export interface EnsureAccessProps {
  invalidAccess?: string
  alertClass?: string
}
export type EnsureAccessEmits = EmitsDone

export interface EnsureAccessDialogProps {
  title?: string
  subtitle?: string
  invalidAccess?: string
  alertClass?: string
}
export type EnsureAccessDialogEmits = EmitsDone

export interface CloseButtonProps {
  buttonClass?: string
  title?: string
}
export type CloseButtonEmits = EmitsClose

export interface ModalLookupProps {
  id?: string
  refInfo: RefInfo
  skip?: number
  prefs?: ApiPrefs
  selectedColumns?:string[]|string

  allowFiltering?: boolean|null
  showPreferences?: boolean|null
  showPagingNav?: boolean|null
  showPagingInfo?: boolean|null
  showResetPreferences?: boolean|null
  showFiltersView?: boolean|null
  toolbarButtonClass?: string

  canFilter?:(column:string) => boolean

  type?: string|InstanceType<any>|Function
  modelTitle?: string
  newButtonLabel?: string
  configureField?: (field:InputProp) => void
}
export interface ModalLookupEmits {
    // (e: "headerSelected", name:string, ev:Event): void
    (e: "done", item:any): void
}

export interface TabsProps {
    tabs: {[name:string]:Component }
    id?: string
    param?: string
    label?: (tab:string) => string
    selected?: string
    tabClass?: string
    bodyClass?: string
    url?:boolean
    clearQuery?:boolean
}

export interface DarkModeToggleProps {
}

export interface SignInProps {
  provider?: string
  title?: string
  tabs?: boolean|"false"
  oauth?: boolean|"false"
}
export interface SignInEmits {
  (e:'login', auth:AuthenticateResponse): void
}

export interface MarkdownInputProps {
  status?: ResponseStatus|null
  id: string
  inputClass?: string
  label?: string
  labelClass?: string
  help?: string
  placeholder?: string
  modelValue?: string

  counter?: boolean
  rows?: number
  //rules
  errorMessages?: string[]
  lang?: string
  autoFocus?: boolean
  disabled?: boolean
  helpUrl?: string
  hide?: string|MarkdownInputOptions|MarkdownInputOptions[]
}
export type MarkdownInputEmits = EmitsUpdateModelValue<string> & EmitsClose

export interface SidebarLayoutProps {
}
export interface SidebarLayoutExpose { 
  show(): void 
  hide(): void 
  toggle(show:boolean): void 
}

/**
 * Helper type for defining Vue components with props and emits in a cleaner way
 * 
 * @template TProps - Component props interface
 * @template TEmits - Component emits interface (can be any object with string keys)
 * 
 * @example
 * ```typescript
 * interface MyProps {
 *   message: string
 *   count?: number
 * }
 * 
 * interface MyEmits {
 *   update: (value: string) => void
 *   click: (event: MouseEvent) => void
 * }
 * 
 * type MyComponent = DefineComponentWithEmits<MyProps, MyEmits>
 * ```
 */
export type DefineComponentWithEmits<
  TProps = {},
  TEmits = {}
> = DefineComponent<
  TProps,   // Props
  {},       // Setup return
  {},       // Data
  {},       // Computed
  {},       // Methods
  {},       // Mixin
  {},       // Extends
  TEmits extends EmitsOptions ? TEmits : EmitsOptions    // Conditional type to handle compatibility
>

// Example 1: Basic button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
}
interface ButtonEmits {
  click: (event: MouseEvent) => true
  focus: (event: FocusEvent) => true
  blur: (event: FocusEvent) => true
}
export type ButtonComponent = DefineComponentWithEmits<ButtonProps, ButtonEmits>

// Component Type Definitions (these are the actual Vue component types)
export type TextInput = DefineComponent<TextInputProps>
export type TextareaInput = DefineComponent<TextareaInputProps>
export type SelectInput = DefineComponent<SelectInputProps>
export type CheckboxInput = DefineComponentWithEmits<CheckboxInputProps,CheckboxInputEmits>
export type FileInput = DefineComponent<FileInputProps>
export type TagInput = DefineComponentWithEmits<TagInputProps,TagInputEmits>
export type Autocomplete = DefineComponentWithEmits<AutocompleteProps,AutocompleteEmits>
export type Combobox = DefineComponentWithEmits<ComboboxProps,ComboboxEmits>
export type DynamicInput = DefineComponentWithEmits<DynamicInputProps,DynamicInputEmits>
export type LookupInput = DefineComponentWithEmits<LookupInputProps,LookupInputEmits>

export type PrimaryButton = DefineComponent<PrimaryButtonProps>
export type SecondaryButton = DefineComponent<SecondaryButtonProps>
export type OutlineButton = DefineComponent<OutlineButtonProps>

export type AutoForm = DefineComponentWithEmits<AutoFormProps,AutoFormEmits>
export type AutoCreateForm = DefineComponentWithEmits<AutoCreateFormProps,AutoCreateFormEmits>
export type AutoEditForm = DefineComponentWithEmits<AutoEditFormProps,AutoEditFormEmits>
export type AutoViewForm = DefineComponentWithEmits<AutoViewFormProps,AutoViewFormEmits>
export type AutoFormFields = DefineComponentWithEmits<AutoFormFieldsProps,AutoFormFieldsEmits>
export type ConfirmDelete = DefineComponentWithEmits<ConfirmDeleteProps,ConfirmDeleteEmits>
export type FormLoading = DefineComponent<FormLoadingProps>

export type DataGrid = DefineComponentWithEmits<DataGridProps,DataGridEmits>
export type AutoQueryGrid = DefineComponentWithEmits<AutoQueryGridProps,AutoQueryGridEmits>
export type CellFormat = DefineComponent<CellFormatProps>
export type PreviewFormat = DefineComponent<PreviewFormatProps>
export type HtmlFormat = DefineComponent<HtmlFormatProps>
export type MarkupFormat = DefineComponent<MarkupFormatProps>
export type MarkupModel = DefineComponent<MarkupModelProps>

export type ModalDialog = DefineComponentWithEmits<ModalDialogProps,ModalDialogEmits>
export type SlideOver = DefineComponentWithEmits<SlideOverProps,SlideOverEmits>
export type ModalLookup = DefineComponentWithEmits<ModalLookupProps,ModalLookupEmits>

export type Breadcrumbs = DefineComponent<BreadcrumbsProps>
export type Breadcrumb = DefineComponent<BreadcrumbProps>
export type NavList = DefineComponent<NavListProps>
export type NavListItem = DefineComponent<NavListItemProps>

export type Loading = DefineComponent<LoadingProps>
export type Icon = DefineComponent<IconProps>
export type Alert = DefineComponent<AlertProps>
export type AlertSuccess = DefineComponent<AlertSuccessProps>
export type ErrorSummary = DefineComponent<ErrorSummaryProps>
export type InputDescription = DefineComponent<InputDescriptionProps>
export type TextLink = DefineComponent<TextLinkProps>

export type SettingsIcons = DefineComponent<SettingsIconsProps>
export type FilterViews = DefineComponent<FilterViewsProps>
export type FilterColumn = DefineComponent<FilterColumnProps>
export type QueryPrefs = DefineComponent<QueryPrefsProps>
export type EnsureAccess = DefineComponentWithEmits<EnsureAccessProps,EnsureAccessEmits>
export type EnsureAccessDialog = DefineComponentWithEmits<EnsureAccessDialogProps,EnsureAccessDialogEmits>

export type CloseButton = DefineComponentWithEmits<CloseButtonProps,CloseButtonEmits>
export type Tabs = DefineComponent<TabsProps>
export type DarkModeToggle = DefineComponent<DarkModeToggleProps>
export type SignIn = DefineComponentWithEmits<SignInProps,SignInEmits>
export type MarkdownInput = DefineComponentWithEmits<MarkdownInputProps,MarkdownInputEmits>
export type SidebarLayout = DefineComponent<SidebarLayoutProps>
