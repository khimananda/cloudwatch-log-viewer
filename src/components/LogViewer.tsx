import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  ButtonGroup,
  Container,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getLogGroups, getRecentLogs, LogGroup } from '../services/cloudwatch-logs-service';
import { OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

const LogViewer = () => {
  const [logGroups, setLogGroups] = useState<LogGroup[]>([]);
  const [filteredLogGroups, setFilteredLogGroups] = useState<LogGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [logs, setLogs] = useState<OutputLogEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<OutputLogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prefix, setPrefix] = useState<string | undefined>('/ecs');
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState(10 * 60 * 1000); // default 10 min

  const fetchLogGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await getLogGroups(prefix);
      setLogGroups(groups);
      setFilteredLogGroups(groups);
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0].logGroupName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      setError(null);
      const logEvents = await getRecentLogs(selectedGroup, Date.now() - timeRange);
      setLogs(logEvents);
      setFilteredLogs(logEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogGroups();
  }, [prefix]);

  useEffect(() => {
    if (selectedGroup) {
      fetchLogs();
    }
  }, [selectedGroup]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const searchTermLower = value.toLowerCase();
    const filteredGroups = logGroups.filter(group =>
      group.logGroupName.toLowerCase().includes(searchTermLower)
    );
    setFilteredLogGroups(filteredGroups);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLogLevelInfo = (message: string) => {
    if (message.includes('ERROR')) {
      return {
        level: 'ERROR',
        color: 'error',
        icon: '🔴',
        bgColor: (theme: any) => alpha(theme.palette.error.main, 0.1)
      };
    }
    if (message.includes('WARN')) {
      return {
        level: 'WARN',
        color: 'warning',
        icon: '⚠️',
        bgColor: (theme: any) => alpha(theme.palette.warning.main, 0.1)
      };
    }
    if (message.includes('INFO')) {
      return {
        level: 'INFO',
        color: 'info',
        icon: 'ℹ️',
        bgColor: (theme: any) => alpha(theme.palette.info.main, 0.1)
      };
    }
    return {
      level: 'LOG',
      color: 'default',
      icon: '📝',
      bgColor: (theme: any) => alpha(theme.palette.grey[500], 0.1)
    };
  };

  return (
    <Container 
      sx={{ 
        py: 4,
        maxWidth: '1200px !important',
        width: '100%',
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box 
        sx={{ 
          mb: 6,
          background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)',
          borderRadius: 3,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }
        }}
      >
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          CloudWatch Logs Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          mt: 1,
          opacity: 0.9,
          position: 'relative',
        }}>
          Monitoring {logGroups.length} Log Groups
        </Typography>
        <ButtonGroup 
          variant="contained" 
          sx={{ 
            position: 'absolute',
            top: '50%',
            right: 32,
            transform: 'translateY(-50%)',
            '& .MuiButton-root': {
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#4F46E5',
              '&.active': {
                bgcolor: 'white',
                color: '#4F46E5',
                fontWeight: 600,
              },
              '&:hover': {
                bgcolor: 'white',
              },
            },
          }}
        >
          <Button
            className={prefix === '/ecs' ? 'active' : ''}
            onClick={() => setPrefix('/ecs')}
          >
            ECS Logs
          </Button>
          <Button
            className={prefix === undefined ? 'active' : ''}
            onClick={() => setPrefix(undefined)}
          >
            All Logs
          </Button>
        </ButtonGroup>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Log Group</InputLabel>
            <Select
              value={selectedGroup}
              label="Select Log Group"
              onChange={(e) => setSelectedGroup(e.target.value)}
              disabled={loading}
              open={menuOpen}
              onOpen={() => setMenuOpen(true)}
              onClose={() => setMenuOpen(false)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 400,
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                    },
                  },
                },
              }}
            >
              <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search log groups..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearch('');
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                      },
                    },
                  }}
                />
              </Box>
              {filteredLogGroups.map((group) => (
                <MenuItem 
                  key={group.logGroupName} 
                  value={group.logGroupName}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography 
                      sx={{ 
                        flex: 1,
                        ...(searchTerm && {
                          '& mark': {
                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.3),
                            color: 'inherit',
                            padding: '0 2px',
                            borderRadius: '2px',
                          },
                        }),
                      }}
                      dangerouslySetInnerHTML={{
                        __html: searchTerm
                          ? group.logGroupName.replace(
                              new RegExp(searchTerm, 'gi'),
                              (match) => `<mark>${match}</mark>`
                            )
                          : group.logGroupName,
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              Showing {filteredLogGroups.length} of {logGroups.length} log groups
              {prefix && ` • Filtered by prefix: ${prefix}`}
            </Typography>
          </FormControl>
          <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setTimeRange(1 * 60 * 1000)} variant={timeRange === 1 * 60 * 1000 ? 'contained' : 'outlined'}>1 min</Button>
              <Button onClick={() => setTimeRange(10 * 60 * 1000)} variant={timeRange === 10 * 60 * 1000 ? 'contained' : 'outlined'}>10 min</Button>
              <Button onClick={() => setTimeRange(15 * 60 * 1000)} variant={timeRange === 15 * 60 * 1000 ? 'contained' : 'outlined'}>15 min</Button>
              <Button onClick={() => setTimeRange(60 * 60 * 1000)} variant={timeRange === 60 * 60 * 1000 ? 'contained' : 'outlined'}>1 hour</Button>
            </ButtonGroup>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Logs
            </Typography>
            <Tooltip title="Refresh logs">
              <IconButton
                onClick={fetchLogs}
                disabled={loading || !selectedGroup}
                color="primary"
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          {error && (
            <Box sx={{ 
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Typography>
                Error: {error}
              </Typography>
            </Box>
          )}

          <List sx={{ 
            maxHeight: 600, 
            overflow: 'auto',
            bgcolor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.02) : alpha(theme.palette.primary.main, 0.1),
            borderRadius: 2,
            p: 0,
          }}>
            {filteredLogs.map((log, index) => {
              const logInfo = getLogLevelInfo(log.message || '');
              return (
                <ListItem 
                  key={index}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    },
                    ...(searchTerm && (log.message || '').toLowerCase().includes(searchTerm.toLowerCase()) && {
                      bgcolor: (theme) => alpha(theme.palette.warning.light, 0.1),
                    }),
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                        <Chip 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <span>{logInfo.icon}</span>
                              <span>{logInfo.level}</span>
                            </Box>
                          }
                          size="small"
                          color={logInfo.color as any}
                          sx={{ 
                            height: 24,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            bgcolor: logInfo.bgColor,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                        <Typography 
                          component="pre" 
                          sx={{ 
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            m: 0,
                            fontSize: '0.875rem',
                            flex: 1,
                            ...(searchTerm && {
                              '& mark': {
                                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.3),
                                color: 'inherit',
                                padding: '0 2px',
                                borderRadius: '2px',
                              },
                            }),
                          }}
                          dangerouslySetInnerHTML={{
                            __html: searchTerm
                              ? (log.message || '').replace(
                                  new RegExp(searchTerm, 'gi'),
                                  (match) => `<mark>${match}</mark>`
                                )
                              : log.message || '',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          pl: 5,
                        }}
                      >
                        {log.timestamp ? formatTimestamp(log.timestamp) : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
            {filteredLogs.length === 0 && !loading && (
              <ListItem>
                <ListItemText 
                  primary={
                    <Typography 
                      sx={{ 
                        textAlign: 'center', 
                        color: 'text.secondary',
                        py: 8,
                      }}
                    >
                      {searchTerm ? 'No matching logs found' : 'No logs found'}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LogViewer; 