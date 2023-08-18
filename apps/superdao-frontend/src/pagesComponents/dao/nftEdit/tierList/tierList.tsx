import React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import { TierListItem } from './tierListItem';
import { RemoveTierModalWrapper } from './removeTierModalWrapper';
import { ConfiguredNftTier } from './configureNftTiers';

type Props = {
	tiers: ConfiguredNftTier[];
	onClick: (i: any, index: number) => void;
	onRemoveItem: (idx: number) => void;
	onTiersOrderChange: (start: number, end: number) => void;
	onHiddennessToggle: (idx: number, isHidden: boolean) => void;
};

export const TierList: React.FC<Props> = (props) => {
	const { tiers, onClick, onRemoveItem, onTiersOrderChange, onHiddennessToggle } = props;

	const handleDragEnd = (result: DropResult) => {
		// dropped outside the list
		if (!result.destination) {
			return;
		}

		onTiersOrderChange(result.source.index, result.destination.index);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<RemoveTierModalWrapper onRemoveItemClick={onRemoveItem}>
				{({ onRemoveTierClick }) => (
					<Droppable droppableId="droppable_tier_list">
						{(dropProvided) => (
							<div className="flex flex-col" {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
								{tiers.map((tier, idx) => {
									return (
										<Draggable key={tier.id} draggableId={tier.id} index={idx}>
											{(provided) => (
												<TierListItem
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													containerRef={provided.innerRef}
													tierName={tier?.tierName ?? tier?.id}
													tierArtworkType={tier?.tierArtworkType}
													tierMaxAmount={tier.maxAmount}
													tierTotalAmount={tier.totalAmount}
													tierPreview={tier?.artworks[0]?.image}
													isDeactivated={tier.isDeactivated}
													isHidden={tier.isHidden}
													onClick={() => onClick(tier, idx)}
													onClickRemove={onRemoveTierClick(tier, idx)}
													onHiddennessToggle={() => onHiddennessToggle(idx, !tier.isHidden)}
												/>
											)}
										</Draggable>
									);
								})}

								{dropProvided.placeholder}
							</div>
						)}
					</Droppable>
				)}
			</RemoveTierModalWrapper>
		</DragDropContext>
	);
};
