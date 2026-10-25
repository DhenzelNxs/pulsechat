import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import type { RoomMember } from '../../api/rooms';
import { displayName, initials } from '../../lib/displayName';

interface GroupMembersDialogProps {
  members: RoomMember[];
  onClose: () => void;
}

export function GroupMembersDialog({ members, onClose }: GroupMembersDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('chat.groupMembersTitle', { count: members.length })}
        <IconButton aria-label={t('chat.close')} onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List disablePadding>
          {members.map((member) => (
            <ListItem key={member._id} disableGutters>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials(member)}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={displayName(member)} secondary={`@${member.username}`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
