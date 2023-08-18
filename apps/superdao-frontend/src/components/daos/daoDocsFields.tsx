import { useTranslation } from 'next-i18next';
import { Control, useFieldArray, UseFormRegister, FieldErrors } from 'react-hook-form';
import cn from 'classnames';

import { Input } from '../input';
import { AddBoldIcon, CrossIcon } from '../assets/icons';
import { Label1 } from 'src/components/text';
import { DaoFields } from 'src/validators/daos';

type Props = {
	register: UseFormRegister<DaoFields>;
	control: Control<DaoFields>;
	errors: FieldErrors<DaoFields>;
};

export const DaoDocsFields = (props: Props) => {
	const { register, control, errors } = props;

	const { t } = useTranslation();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'documents'
	});

	const docsPlaceholders = t('components.dao.docs.placeholders', { returnObjects: true });
	const showDeleteDocButton = fields.length > 1;

	return (
		<div className="flex w-full flex-col">
			<Label1 className="mb-2 sm:hidden">Docs</Label1>

			<div className="mb-2 hidden gap-3 sm:flex">
				<Label1 className="flex-1">{t('components.dao.docs.nameLabel')}</Label1>
				<Label1 className="flex-1">{t('components.dao.docs.linkLabel')}</Label1>
				<div className="-ml-1 w-10" /> {/* cross icon emulation */}
			</div>

			<div className="flex flex-col gap-4">
				{fields.map((field, index) => {
					const error = errors.documents?.[index]?.name?.message;

					return (
						<div className="grid grid-cols-[1fr_40px] gap-3 sm:flex" key={field.id}>
							<Input placeholder={docsPlaceholders[index]} error={error} {...register(`documents.${index}.name`)} />

							<button
								className={cn('text-foregroundPrimary -ml-1 flex items-center px-3 sm:order-last', {
									invisible: !showDeleteDocButton
								})}
								onClick={() => remove(index)}
							>
								<CrossIcon />
							</button>

							<Input
								error={error}
								placeholder={t('components.dao.docs.urlPlaceholder')}
								{...register(`documents.${index}.url`)}
							/>
						</div>
					);
				})}
			</div>

			{fields.length < 3 && (
				<div
					className="text-foregroundPrimary hover-firstChild:bg-backgroundTertiary m-0 mt-4 flex cursor-pointer items-center gap-4 border-none bg-transparent text-[15px] font-semibold leading-6"
					onClick={() => append({ name: '', url: '' })}
					data-testid="DaoDocs__addDocsButton"
				>
					<div className="bg-backgroundSecondary flex h-10 w-10 items-center justify-center rounded-full transition-all">
						<AddBoldIcon width={18} height={18} />
					</div>
					<Label1>{t('components.dao.docs.addLabel')}</Label1>
				</div>
			)}
		</div>
	);
};
