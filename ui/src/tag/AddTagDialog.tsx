import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {TagDefinitionType} from '../gql/__generated__/globalTypes';
import {SliderPicker} from 'react-color';
import {InputLabel, MenuItem} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Mutation, {FetchResult, MutationFn, MutationUpdaterFn} from 'react-apollo/Mutation';
import {AddTag, AddTagVariables} from '../gql/__generated__/AddTag';
import * as gqlTags from '../gql/tags';
import {Tags} from '../gql/__generated__/Tags';
import {TagSelectorEntry} from './tagSelectorEntry';

interface AddTagDialogProps {
    initialName: string;
    open: boolean;
    close: () => void;
    onAdded: (tag: TagSelectorEntry['tag']) => void;
}

export const AddTagDialog: React.FC<AddTagDialogProps> = ({close, open, initialName, onAdded}) => {
    const [name, setName] = React.useState(initialName);
    const [color, setColor] = React.useState('#ffffff');
    const [type, setType] = React.useState(TagDefinitionType.singlevalue);

    const update: MutationUpdaterFn<AddTag> = (cache, {data}) => {
        if (data === undefined || data.createTag === null) {
            return;
        }

        const oldValue = cache.readQuery<Tags>({query: gqlTags.Tags});

        if (oldValue && oldValue.tags) {
            cache.writeQuery<Tags>({
                query: gqlTags.Tags,
                data: {tags: [...oldValue.tags, data.createTag]},
            });
        }
    };

    return (
        <Mutation<AddTag, AddTagVariables> mutation={gqlTags.AddTag} update={update}>
            {(addTag: MutationFn<AddTag, AddTagVariables>) => (
                <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title" fullWidth>
                    <DialogTitle id="form-dialog-title">Create Tag</DialogTitle>
                    <DialogContent>
                        <DialogContentText />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel htmlFor="color-picker" shrink={true}>
                                Color
                            </InputLabel>
                            <div id="color-picker" style={{marginTop: 25}}>
                                <SliderPicker onChange={(c) => setColor(c.hex)} color={color} />
                            </div>
                        </FormControl>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="tag-type">Type</InputLabel>
                            <Select
                                onChange={(e) => setType(e.target.value as TagDefinitionType)}
                                value={type}
                                inputProps={{
                                    name: 'age',
                                    id: 'age-simple',
                                }}>
                                <MenuItem value={TagDefinitionType.novalue}>Valueless</MenuItem>
                                <MenuItem value={TagDefinitionType.singlevalue}>With Value</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={close} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                addTag({variables: {name, color, type}}).then((result: FetchResult<AddTag> | void) => {
                                    close();
                                    if (result && result.data && result.data.createTag) {
                                        onAdded(result.data.createTag);
                                    }
                                });
                            }}
                            color="primary">
                            Create Tag
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Mutation>
    );
};