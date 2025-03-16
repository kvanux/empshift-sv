<script lang="ts">
  import {
    GradientButton,
    Card,
    Button,
    ButtonGroup,
    Avatar,
    Label,
    Input,
    Helper,
    Alert,
    Range,
    Tooltip,
  } from "flowbite-svelte";
  import {
    WandMagicSparklesOutline,
    ChevronDownOutline,
    ChevronUpOutline,
    ExclamationCircleSolid,
    InfoCircleSolid,
    BanOutline,
    LockOutline,
    LockOpenOutline,
    HeartOutline,
    PenNibOutline,
    ShareNodesOutline,
    CloseOutline,
  } from "flowbite-svelte-icons";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";

  import type { Staff, Schedule } from "./type";

  let daysCount = $state(0);
  let shiftCount = $state(0);
  let minStaff = $state(0);
  let maxStaff = $state(0);
  let empCount = $state(0);
  let minShift = $state(0);
  let maxShift = $state(0);

  const weekday = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const days = $derived(weekday.slice(0, daysCount));
  const shifts = $derived(
    Array.from({ length: shiftCount }, (_, i) => `Shift ${i + 1}`)
  );

  let staffs = $state<Staff[]>([]);
  $effect(() => {
    if (staffs.length < empCount) {
      for (let i = staffs.length; i < empCount; i++) {
        staffs.push({
          id: i,
          name: `Employee ${i + 1}`,
          unavailable: [],
          preferred: [],
          assigned: [],
          isOkay: false,
        });
      }
    } else if (staffs.length > empCount) {
      staffs = staffs.slice(0, empCount);
    }
  });
  $effect(() => {
    if (staffs.length === 0 && empCount > 0) {
      for (let i = 0; i < empCount; i++) {
        staffs.push({
          id: i,
          name: `Employee ${i + 1}`,
          unavailable: [],
          preferred: [],
          assigned: [],
          isOkay: false,
        });
      }
    }
  });

  const isValidDaysCount = $derived(daysCount >= 1 && daysCount <= 7);
  const isValidShiftCount = $derived(shiftCount >= 1 && shiftCount <= 24);

  let schedules = $state<Schedule[]>([]);
  let scheduleCount = $derived(daysCount * shiftCount);
  $effect(() => {
    if (isValidDaysCount && isValidShiftCount) {
      if (schedules.length === 0) {
        for (let i = 0; i < shifts.length; i++) {
          for (let j = 0; j < days.length; j++) {
            schedules.push({
              id: `${shifts[i]}${days[j]}`,
              name: shifts[i],
              day: days[j],
              assigned: [],
              prefered: [],
              unavailable: [],
              isOkay: false,
              isLocked: false,
            });
          }
        }
      } else if (
        schedules.length < scheduleCount ||
        schedules.length > scheduleCount
      ) {
        let newSchedule: Schedule[] = [];
        for (let i = 0; i < shifts.length; i++) {
          for (let j = 0; j < days.length; j++) {
            newSchedule.push({
              id: `${shifts[i]}-${days[j]}`,
              name: shifts[i],
              day: days[j],
              assigned: [],
              prefered: [],
              unavailable: [],
              isOkay: false,
              isLocked: false,
            });
          }
        }
        schedules = newSchedule;
      }
    } else {
      schedules = [];
    }
  });

  let isLoading = $state(false);
  let error = $state<string | null>(null);

  let empSessionExpanded = $state(false);
  let toolMode = $state("none");
  let selectedEmp = $state<number>();

  $effect(() => {
    for (let i = 0; i < staffs.length; i++) {
      if (staffs[i].assigned.length < minShift) {
        staffs[i].isOkay = false;
      } else if (staffs[i].assigned.length > maxShift) {
        staffs[i].isOkay = false;
      } else {
        staffs[i].isOkay = true;
      }
    }
  });
</script>

<main class="grid grid-cols-12 min-h-screen">
  <div
    class="flex flex-col gap-4 col-span-3 bg-white border-r border-r-neutral-200 p-6"
  >
    <h2 class="text-lg font-semibold text-gray-800 mb-2">Basic Info</h2>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many working days per week? <span class="text-base font-semibold">
          {daysCount}</span
        ></Label
      >
      <Range bind:value={daysCount} min="0" max="7" class="w-full" />
      {#if daysCount < 0 || daysCount > 7}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span> Please input number from
          1-7.</Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many shifts per day?</Label
      >
      <Input
        type="number"
        bind:value={shiftCount}
        placeholder="Enter number"
        min="0"
        max="12"
        class="w-full"
      />
      {#if shiftCount < 0 || shiftCount > 24}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span> Please input number from
          1-24.</Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >How many employees do you have?</Label
      >
      <Input
        type="number"
        bind:value={empCount}
        placeholder="Enter number"
        min="0"
        max="60"
        class="w-full"
      />
      {#if empCount < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
      {#if empCount > 60}
        <Helper class="mt-2" color="red"
          ><span class="font-medium"
            >We currently only support under 60 staffs total.</span
          ></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Minimum staff required each shift?</Label
      >
      <Input
        type="number"
        bind:value={minStaff}
        placeholder="Enter number"
        min="0"
        max={empCount}
        class="w-full"
      />
      {#if minStaff < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Maximum staff allowed each shift?</Label
      >
      <Input
        type="number"
        bind:value={maxStaff}
        placeholder="Enter number"
        min="0"
        max={empCount}
        class="w-full"
      />
      {#if maxStaff < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Minimum shift required for each staff everyweek?</Label
      >
      <Input
        type="number"
        bind:value={minShift}
        placeholder="Enter number"
        min="0"
        class="w-full"
      />
      {#if minShift < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <div class="mb-1 flex flex-col gap-1 w-full">
      <Label class="block mb-1 text-base font-normal"
        >Maximum shift allowed for each staff everyweek?</Label
      >
      <Input
        type="number"
        bind:value={maxShift}
        placeholder="Enter number"
        min="0"
        max={daysCount * shiftCount}
        class="w-full"
      />
      {#if maxShift < 0}
        <Helper class="mt-2" color="red"
          ><span class="font-medium">Invalid input!</span></Helper
        >
      {/if}
    </div>
    <GradientButton color="pinkToOrange" size="lg" class="mt-2 cursor-pointer"
      ><WandMagicSparklesOutline class="w-5 h-5 me-2" />Magic Schedule</GradientButton
    >
  </div>
  <div class="flex flex-col col-span-9 gap-6 p-6 bg-gray-100">
    {#if minStaff * daysCount * shiftCount > empCount * maxShift}
      <Alert class="text-sm font-normal">
        <ExclamationCircleSolid slot="icon" class="w-5 h-5" />
        <span class="text-sm font-semibold">Impossible requirements!</span>
        Number of shifts for current staffs to work is more than the staffs can handle.
      </Alert>
    {/if}
    {#if daysCount !== 0 && shiftCount !== 0 && maxStaff !== 0 && empCount !== 0 && maxShift !== 0}
      <Alert class="text-sm font-normal cursor-default" color="blue">
        <InfoCircleSolid slot="icon" class="w-5 h-5" />
        <span class="text-sm font-semibold"
          >This is the manual schedule panel.</span
        >
        Select each employee from the Employees section, then select a mode from
        the toolbar: Prefer mode for selecting preferred shifts, Unavailable for
        selecting shifts that the employee can not work, Assign mode is self-explanatory.
        Finally, go ahead and click on the shifts on the schedule to set it.
      </Alert>
    {/if}
    {#if staffs.length > 0 && empCount <= 60}
      <div
        class={`is-expandable flex flex-col p-5 gap-4 bg-white rounded-lg overflow-clip ${empSessionExpanded ? "" : "h-48"}`}
      >
        <div class="flex justify-between items-start">
          <div class="flex gap-3 items-center">
            <h2 class="text-lg font-semibold text-gray-800">Your Employees</h2>
            {#if selectedEmp !== undefined}
              <p class="text-sm font-normal pt-1">
                Selecting: <span class={`text-sm font-medium text-primary-700`}
                  >{staffs[selectedEmp].name}</span
                >
              </p>
            {/if}
          </div>
          <Button
            outline
            color="alternative"
            on:click={() => (empSessionExpanded = !empSessionExpanded)}
            class="hover:bg-gray-50 focus-within:bg-white hover:text-gray-900 focus-within:text-gray-900 focus-within:ring-0 focus-within:outline-0 focus-visible:outline-0 focus-visible:ring-0 border-0 px-2"
          >
            {#if empSessionExpanded}
              <ChevronUpOutline class="w-5 h-5" />
            {:else}
              <ChevronDownOutline class="w-5 h-5" />
            {/if}
          </Button>
        </div>
        <div class="flex flex-wrap gap-2 rounded-2xl w-full">
          {#each staffs as staff, i}
            <Card
              class={`cursor-pointer flex p-4 gap-2 max-w-[218px] flex-row shadow-none min-w-fit hover:border-primary-400 hover:border hover:bg-neutral-50 transition-all duration-500 ease-out force-padding-16 ${selectedEmp === staff.id && "border-primary-500"}`}
              on:click={() => {
                selectedEmp = staff.id;
              }}
            >
              <Avatar class="shrink-0" />
              <div class="flex flex-col gap-1 w-fit shrink-0">
                <input
                  type="text"
                  bind:value={staff.name}
                  class="cursor-text max-w-[120px] bg-transparent border-none outline-none caret-black focus:ring-0 p-0 text-sm text-gray-900 font-normal hover:bg-primary-50"
                />
                <div
                  id="tooltip-employee-trigger"
                  class="flex items-center gap-1"
                >
                  <ExclamationCircleSolid
                    class={`w-4 h-4 ${staff.isOkay ? "text-green-700" : "text-amber-700"}`}
                  />
                  <p
                    class={`text-sm font-normal ${staff.isOkay ? "text-green-800" : "text-amber-800"}`}
                  >
                    {staff.isOkay ? "Okay" : "Not okay"}
                  </p>
                </div>
                <Tooltip
                  triggeredBy="#tooltip-employee-trigger"
                  placement="top"
                  arrow={false}
                  class="shadow-none"
                >
                  <ul>
                    {#if staff.assigned.length < minShift}
                      <li>Not enough shift assigned</li>
                    {/if}
                    {#if staff.assigned.length > maxShift}
                      <li>Overworked</li>
                    {/if}
                  </ul>
                </Tooltip>
              </div>
            </Card>
          {/each}
        </div>
      </div>
    {/if}
    <div class="w-full flex justify-between bg-white rounded-lg overflow-clip">
      <div class="flex gap-3 p-3 pl-4 items-center">
        <h3 class="text-lg font-semibold text-gray-800">Toolbar</h3>
        <p class="text-sm font-normal pt-1">
          Current mode: <span
            class={`text-sm font-medium ${toolMode === "none" ? "text-gray-500" : "text-primary-700"}`}
            >{toolMode}</span
          >
        </p>
        {#if toolMode !== "none"}
          <button
            onclick={() => {
              toolMode = "none";
            }}
          >
            <CloseOutline
              class="w-4 h-4 text-primary-700 -ml-2 mt-1 cursor-pointer"
            />
          </button>
        {/if}
      </div>
      <ButtonGroup class="*:ring-primary-700!">
        <Button
          class={`cursor-pointer border-0 rounded-none! focus-within:ring-0 ${toolMode === "Prefer" ? "text-primary-700 bg-primary-50" : "text-gray-600"}`}
          on:click={() => {
            toolMode = "Prefer";
          }}
        >
          <HeartOutline class="w-4 h-4 me-2" />
          Prefer
        </Button>
        <Button
          class={`cursor-pointer border-0 rounded-none! focus-within:ring-0 ${toolMode === "Unavailable" ? "text-primary-700 bg-primary-50" : "text-gray-600"}`}
          on:click={() => {
            toolMode = "Unavailable";
          }}
        >
          <BanOutline class="w-4 h-4 me-2" />
          Unavailable
        </Button>
        <Button
          class={`cursor-pointer border-0 rounded-none! focus-within:ring-0 ${toolMode === "Assign" ? "text-primary-700 bg-primary-50" : "text-gray-600"}`}
          on:click={() => {
            toolMode = "Assign";
          }}
        >
          <PenNibOutline class="w-4 h-4 me-2" />
          Assign
        </Button>
      </ButtonGroup>
    </div>
    <div class="flex flex-col p-5 gap-4 bg-white rounded-lg">
      <h2 class="text-lg font-semibold text-gray-800">This Week Schedule</h2>
      {#if isValidDaysCount && isValidShiftCount}
        <Table class="w-full cursor-default">
          <TableHead>
            <TableHeadCell class="text-neutral-500 font-normal"
              >Shifts</TableHeadCell
            >
            {#each days as day, i}
              <TableHeadCell>{day}</TableHeadCell>
            {/each}
          </TableHead>
          <TableBody>
            {#each shifts as shift, i}
              <TableBodyRow>
                <TableBodyCell>{shift}</TableBodyCell>
                {#each days as day, j}
                  <TableBodyCell
                    on:click={() => {
                      if (toolMode === "Assign") {
                        schedules
                          .find(
                            (item) => item.day === day && item.name === shift
                          )
                          ?.assigned.push(selectedEmp as number);
                        staffs
                          .find((item) => item.id === selectedEmp)
                          ?.assigned.push(`${shift}-${day}`);
                      } else if (toolMode === "Unavailable") {
                        schedules
                          .find(
                            (item) => item.day === day && item.name === shift
                          )
                          ?.unavailable.push(selectedEmp as number);
                        staffs
                          .find((item) => item.id === selectedEmp)
                          ?.unavailable.push(`${shift}-${day}`);
                      } else if (toolMode === "Prefer") {
                        schedules
                          .find(
                            (item) => item.day === day && item.name === shift
                          )
                          ?.prefered.push(selectedEmp as number);
                        staffs
                          .find((item) => item.id === selectedEmp)
                          ?.preferred.push(`${shift}-${day}`);
                      }
                    }}
                    class={`hover:bg-gray-50 flex flex-col gap-2 ${selectedEmp === undefined || toolMode === "none" ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <!-- assigned employee list -->
                  </TableBodyCell>
                {/each}
              </TableBodyRow>
            {/each}
          </TableBody>
        </Table>
      {:else}
        <div class="flex items-center gap-1">
          <ExclamationCircleSolid class={`w-4 h-4 text-rose-700`} />
          <p class={`text-sm font-normal text-rose-800`}>
            Please enter valid number of shift types and working days per week.
          </p>
        </div>
      {/if}
    </div>
  </div>
</main>
