import { getMemberAndProject } from '/@/api/spent'
export interface OptionItem {
  value: number
  label: string
}
export function useMemberAndProject() {
  const [members, setMembers] = useState<OptionItem[]>([])
  const [projects, setProjects] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response: {
        members: OptionItem[]
        projects: OptionItem[]
      } = await getMemberAndProject()
      if (isMounted.current) {
        setMembers(response.members)
        setProjects(response.projects)
      }
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchData()
    }

    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    members,
    projects,
    loading,
  }
}
