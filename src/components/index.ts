import type { DefineComponent, EmitsOptions } from 'vue'
import type { 
    PrimaryButtonProps,
    AlertProps,
    AlertSuccessProps,
    ErrorSummaryProps,
    InputDescriptionProps,
    IconProps,
    LoadingProps,
    OutlineButtonProps,
    SecondaryButtonProps,
    TextLinkProps,
    BreadcrumbsProps,
    BreadcrumbProps,
    NavListProps,
    NavListItemProps,
    AutoQueryGridProps,
    AutoQueryGridEmits,
    SettingsIconsProps,
    FilterViewsProps,
    FilterColumnProps,
    FilterColumnEmits,
    QueryPrefsProps,
    QueryPrefsEmits,
    EnsureAccessProps,
    EnsureAccessEmits,
    EnsureAccessDialogProps,
    EnsureAccessDialogEmits,
    TextInputProps,
    TextInputExpose,
    TextareaInputProps,
    SelectInputProps,
    CheckboxInputProps,
    CheckboxInputEmits,
    TagInputProps,
    TagInputEmits,
    FileInputProps,
    AutocompleteProps,
    AutocompleteEmits,
    ComboboxProps,
    ComboboxEmits,
    DynamicInputProps,
    DynamicInputEmits,
    LookupInputProps,
    LookupInputEmits,
    AutoFormFieldsProps,
    AutoFormFieldsEmits,
    AutoFormProps,
    AutoFormEmits,
    AutoCreateFormProps,
    AutoCreateFormEmits,
    AutoEditFormProps,
    AutoEditFormEmits,
    AutoViewFormProps,
    AutoViewFormEmits,
    ConfirmDeleteProps,
    ConfirmDeleteEmits,
    FormLoadingProps,
    DataGridProps,
    DataGridEmits,
    CellFormatProps,
    PreviewFormatProps,
    HtmlFormatProps,
    MarkupFormatProps,
    MarkupModelProps,
    ModalDialogProps,
    ModalDialogEmits,
    SlideOverProps,
    SlideOverEmits,
    ModalLookupProps,
    ModalLookupEmits,
    CloseButtonProps,
    CloseButtonEmits,
    TabsProps,
    SignInProps,
    SignInEmits,
    MarkdownInputProps,
    MarkdownInputEmits,
    SidebarLayoutExpose
} from './types'


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
 * type MyComponentComponent = DefineComponentWithEmits<MyProps, MyEmits>
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

import AlertVue from './Alert.vue'
import AlertSuccessVue from './AlertSuccess.vue'
import ErrorSummaryVue from './ErrorSummary.vue'
import InputDescriptionVue from './InputDescription.vue'
import IconVue from './Icon.vue'
import LoadingVue from './Loading.vue'

import OutlineButtonVue from './OutlineButton.vue'
import PrimaryButtonVue from './PrimaryButton.vue'
import SecondaryButtonVue from './SecondaryButton.vue'
import TextLinkVue from './TextLink.vue'

import BreadcrumbsVue from './Breadcrumbs.vue'
import BreadcrumbVue from './Breadcrumb.vue'
import NavListVue from './NavList.vue'
import NavListItemVue from './NavListItem.vue'

import AutoQueryGridVue from './AutoQueryGrid.vue'
import SettingsIconsVue from './SettingsIcons.vue'
import FilterViewsVue from './grids/FilterViews.vue'
import FilterColumnVue from './grids/FilterColumn.vue'
import QueryPrefsVue from './grids/QueryPrefs.vue'
import EnsureAccessVue from './EnsureAccess.vue'
import EnsureAccessDialogVue from './EnsureAccessDialog.vue'

import TextInputVue from './TextInput.vue'
import TextareaInputVue from './TextareaInput.vue'
import SelectInputVue from './SelectInput.vue'
import CheckboxInputVue from './CheckboxInput.vue'
import TagInputVue from './TagInput.vue'
import FileInputVue from './FileInput.vue'
import AutocompleteVue from './Autocomplete.vue'
import ComboboxVue from './Combobox.vue'
import DynamicInputVue from './DynamicInput.vue'
import LookupInputVue from './LookupInput.vue'

import AutoFormFieldsVue from './AutoFormFields.vue'
import AutoFormVue from './AutoForm.vue'
import AutoCreateFormVue from './AutoCreateForm.vue'
import AutoEditFormVue from './AutoEditForm.vue'
import AutoViewFormVue from './AutoViewForm.vue'
import ConfirmDeleteVue from './ConfirmDelete.vue'
import FormLoadingVue from './FormLoading.vue'

import DataGridVue from './DataGrid.vue'
import CellFormatVue from './CellFormat.vue'
import PreviewFormatVue from './PreviewFormat.vue'
import HtmlFormatVue from './HtmlFormat.vue'
import MarkupFormatVue from './MarkupFormat.vue'
import MarkupModelVue from './MarkupModel.vue'

import CloseButtonVue from './CloseButton.vue'
import SlideOverVue from './SlideOver.vue'
import ModalDialogVue from './ModalDialog.vue'
import ModalLookupVue from './ModalLookup.vue'
import TabsVue from './Tabs.vue'

import DarkModeToggleVue from './DarkModeToggle.vue'
import SignInVue from './SignIn.vue'
import MarkdownInputVue from './MarkdownInput.vue'
import SidebarLayoutVue from './SidebarLayout.vue'

export const Alert = AlertVue as unknown as DefineComponent<AlertProps>
export const AlertSuccess = AlertSuccessVue as unknown as DefineComponent<AlertSuccessProps>
export const ErrorSummary = ErrorSummaryVue as unknown as DefineComponent<ErrorSummaryProps>
export const InputDescription = InputDescriptionVue as unknown as DefineComponent<InputDescriptionProps>
export const Icon = IconVue as unknown as DefineComponent<IconProps>
export const Loading = LoadingVue as unknown as DefineComponent<LoadingProps>

export const OutlineButton = OutlineButtonVue as unknown as DefineComponent<OutlineButtonProps>
export const PrimaryButton = PrimaryButtonVue as unknown as DefineComponent<PrimaryButtonProps>
export const SecondaryButton = SecondaryButtonVue as unknown as DefineComponent<SecondaryButtonProps>
export const TextLink = TextLinkVue as unknown as DefineComponent<TextLinkProps>

export const Breadcrumbs = BreadcrumbsVue as unknown as DefineComponent<BreadcrumbsProps>
export const Breadcrumb = BreadcrumbVue as unknown as DefineComponent<BreadcrumbProps>
export const NavList = NavListVue as unknown as DefineComponent<NavListProps>
export const NavListItem = NavListItemVue as unknown as DefineComponent<NavListItemProps>

export const AutoQueryGrid = AutoQueryGridVue as unknown as DefineComponentWithEmits<AutoQueryGridProps,AutoQueryGridEmits>
export const SettingsIcons = SettingsIconsVue as unknown as DefineComponent<SettingsIconsProps>
export const FilterViews = FilterViewsVue as unknown as DefineComponent<FilterViewsProps>
export const FilterColumn = FilterColumnVue as unknown as DefineComponentWithEmits<FilterColumnProps,FilterColumnEmits>
export const QueryPrefs = QueryPrefsVue as unknown as DefineComponentWithEmits<QueryPrefsProps,QueryPrefsEmits>
export const EnsureAccess = EnsureAccessVue as unknown as DefineComponentWithEmits<EnsureAccessProps,EnsureAccessEmits>
export const EnsureAccessDialog = EnsureAccessDialogVue as unknown as DefineComponentWithEmits<EnsureAccessDialogProps,EnsureAccessDialogEmits>

export const TextInput = TextInputVue as unknown as DefineComponent<TextInputProps,TextInputExpose>
export const TextareaInput = TextareaInputVue as unknown as DefineComponent<TextareaInputProps>
export const SelectInput = SelectInputVue as unknown as DefineComponent<SelectInputProps>
export const CheckboxInput = CheckboxInputVue as unknown as DefineComponentWithEmits<CheckboxInputProps,CheckboxInputEmits>
export const TagInput = TagInputVue as unknown as DefineComponentWithEmits<TagInputProps,TagInputEmits>
export const FileInput = FileInputVue as unknown as DefineComponent<FileInputProps>
export const Autocomplete = AutocompleteVue as unknown as DefineComponentWithEmits<AutocompleteProps,AutocompleteEmits>
export const Combobox = ComboboxVue as unknown as DefineComponentWithEmits<ComboboxProps,ComboboxEmits>
export const DynamicInput = DynamicInputVue as unknown as DefineComponentWithEmits<DynamicInputProps,DynamicInputEmits>
export const LookupInput = LookupInputVue as unknown as DefineComponentWithEmits<LookupInputProps,LookupInputEmits>

export const AutoFormFields = AutoFormFieldsVue as unknown as DefineComponentWithEmits<AutoFormFieldsProps,AutoFormFieldsEmits>
export const AutoForm = AutoFormVue as unknown as DefineComponentWithEmits<AutoFormProps,AutoFormEmits>
export const AutoCreateForm = AutoCreateFormVue as unknown as DefineComponentWithEmits<AutoCreateFormProps,AutoCreateFormEmits>
export const AutoEditForm = AutoEditFormVue as unknown as DefineComponentWithEmits<AutoEditFormProps,AutoEditFormEmits>
export const AutoViewForm = AutoViewFormVue as unknown as DefineComponentWithEmits<AutoViewFormProps,AutoViewFormEmits>
export const ConfirmDelete = ConfirmDeleteVue as unknown as DefineComponentWithEmits<ConfirmDeleteProps,ConfirmDeleteEmits>
export const FormLoading = FormLoadingVue as unknown as DefineComponent<FormLoadingProps>

export const DataGrid = DataGridVue as unknown as DefineComponentWithEmits<DataGridProps,DataGridEmits>
export const CellFormat = CellFormatVue as unknown as DefineComponent<CellFormatProps>
export const PreviewFormat = PreviewFormatVue as unknown as DefineComponent<PreviewFormatProps>
export const HtmlFormat = HtmlFormatVue as unknown as DefineComponent<HtmlFormatProps>
export const MarkupFormat = MarkupFormatVue as unknown as DefineComponent<MarkupFormatProps>
export const MarkupModel = MarkupModelVue as unknown as DefineComponent<MarkupModelProps>

export const CloseButton = CloseButtonVue as unknown as DefineComponentWithEmits<CloseButtonProps,CloseButtonEmits>
export const SlideOver = SlideOverVue as unknown as DefineComponentWithEmits<SlideOverProps,SlideOverEmits>
export const ModalDialog = ModalDialogVue as unknown as DefineComponentWithEmits<ModalDialogProps,ModalDialogEmits>
export const ModalLookup = ModalLookupVue as unknown as DefineComponentWithEmits<ModalLookupProps,ModalLookupEmits>
export const Tabs = TabsVue as unknown as DefineComponent<TabsProps>

export const DarkModeToggle = DarkModeToggleVue as unknown as DefineComponent<{}>
export const SignIn = SignInVue as unknown as DefineComponentWithEmits<SignInProps,SignInEmits>
export const MarkdownInput = MarkdownInputVue as unknown as DefineComponentWithEmits<MarkdownInputProps,MarkdownInputEmits>
export const SidebarLayout = SidebarLayoutVue as unknown as DefineComponent<{},SidebarLayoutExpose>

export const Components = {
    Alert,
    AlertSuccess,
    ErrorSummary,
    InputDescription,
    Icon,
    Loading,

    OutlineButton,
    PrimaryButton,
    SecondaryButton,
    TextLink,

    Breadcrumbs,
    Breadcrumb,
    NavList,
    NavListItem,

    AutoQueryGrid,
    SettingsIcons,
    FilterViews,
    FilterColumn,
    QueryPrefs,
    EnsureAccess,
    EnsureAccessDialog,

    TextInput,
    TextareaInput,
    SelectInput,
    CheckboxInput,
    TagInput,
    FileInput,
    Autocomplete,
    Combobox,
    DynamicInput,
    LookupInput,

    AutoFormFields,
    AutoForm,
    AutoCreateForm,
    AutoEditForm,
    AutoViewForm,
    ConfirmDelete,
    FormLoading,

    DataGrid,
    CellFormat,
    PreviewFormat,
    HtmlFormat,
    MarkupFormat,
    MarkupModel,

    CloseButton,
    SlideOver,
    ModalDialog,
    ModalLookup,
    Tabs,

    DarkModeToggle,
    SignIn,
    MarkdownInput,
    SidebarLayout,
}