# SIC Business Chart Component

Dynamic organization chart component with recursive tree structure. Supports adding, removing, and updating nodes.

## Features

- ✅ Recursive tree structure with unlimited levels
- ✅ Add/Remove child nodes dynamically
- ✅ Update node information
- ✅ Visual org chart styling
- ✅ Customizable colors and avatars
- ✅ Responsive design
- ✅ Event emitters for data tracking

## Usage

### Basic Example

```typescript
import { SicBusinessChart } from '@core/component/sic-organizational-chart/sic-organizational-chart';
import { SicBusinessChartNode } from '@core/component/sic-organizational-chart/sic-organizational-chart.model';

@Component({
  selector: 'app-org-chart-demo',
  standalone: true,
  imports: [SicBusinessChart],
  template: `
    <sic-organizational-chart
      [root]="rootNode"
      (dataChanged)="onDataChanged($event)">
    </sic-organizational-chart>
  `,
})
export class OrgChartDemo {
  rootNode: SicBusinessChartNode = {
    id: 'ceo-1',
    name: 'John Doe',
    title: 'CEO',
    color: '#FF6B6B',
    children: [
      {
        id: 'manager-1',
        name: 'Jane Smith',
        title: 'Manager',
        color: '#4ECDC4',
        children: [
          {
            id: 'tl-1',
            name: 'Bob Johnson',
            title: 'Team Lead',
            color: '#45B7D1',
            children: [],
          },
        ],
      },
    ],
  };

  onDataChanged(updatedTree: SicBusinessChartNode): void {
    console.log('Tree updated:', updatedTree);
  }
}
```

## Data Structure

```typescript
interface SicBusinessChartNode {
  id: string;                    // Unique identifier
  name: string;                  // Person's name
  title: string;                 // Job title/position
  avatar?: string;               // Optional avatar image URL
  color?: string;                // Node border color (hex)
  children?: SicBusinessChartNode[]; // Child nodes (recursive)
}
```

## Events

### Output Events

- `dataChanged` - Emitted whenever tree structure changes
- `nodeAdded` - Emitted when a new child is added
- `nodeRemoved` - Emitted when a node is removed
- `nodeUpdated` - Emitted when a node's data is updated

## Methods

### Public Methods

- `addChild(parentNode)` - Add a new child to a node
- `removeChild(parentNode, childId, childIndex)` - Remove a child node
- `updateNode(node, updates)` - Update node properties

## Styling

The component uses CSS custom properties for theming:

```css
--node-color: Node border and avatar background color
```

## Responsive

- Desktop: Full size nodes with all details
- Tablet: Slightly smaller nodes
- Mobile: Compact layout with minimal spacing
